"""Interactive terminal session WebSocket endpoint."""

import asyncio
import fcntl
import os
import pty
import select
import signal
import struct
import termios
import time
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["session"])

# Configuration for output buffering
BUFFER_FLUSH_INTERVAL = 0.016  # ~60fps, smooth for TUI rendering
BUFFER_MAX_SIZE = 16384  # Flush when buffer exceeds this size
READ_CHUNK_SIZE = 8192  # Larger reads to reduce syscall overhead


class TerminalSession:
    """Manages a PTY session for interactive terminal access."""

    def __init__(self, task_id: str):
        self.task_id = task_id
        self.master_fd: Optional[int] = None
        self.pid: Optional[int] = None
        self.running = False

    def start(self) -> bool:
        """Start the PTY process."""
        # Fork a pseudo-terminal
        pid, master_fd = pty.fork()

        if pid == 0:
            # Child process - execute claude command
            os.environ["TERM"] = "xterm-256color"
            os.execlp(
                "claude",
                "claude",
                "--dangerously-skip-permissions",
                f"/atw:load {self.task_id}",
            )
        else:
            # Parent process
            self.pid = pid
            self.master_fd = master_fd
            self.running = True
            # Set non-blocking mode
            flags = fcntl.fcntl(master_fd, fcntl.F_GETFL)
            fcntl.fcntl(master_fd, fcntl.F_SETFL, flags | os.O_NONBLOCK)
            return True

    def resize(self, rows: int, cols: int):
        """Resize the terminal."""
        if self.master_fd:
            winsize = struct.pack("HHHH", rows, cols, 0, 0)
            fcntl.ioctl(self.master_fd, termios.TIOCSWINSZ, winsize)

    def write(self, data: bytes):
        """Write data to the PTY."""
        if self.master_fd and self.running:
            os.write(self.master_fd, data)

    def read(self) -> Optional[bytes]:
        """Read available data from the PTY."""
        if not self.master_fd or not self.running:
            return None
        try:
            return os.read(self.master_fd, READ_CHUNK_SIZE)
        except (OSError, IOError):
            return None

    def read_all_available(self) -> Optional[bytes]:
        """Read all currently available data from the PTY (drains buffer)."""
        if not self.master_fd or not self.running:
            return None

        chunks = []
        total_size = 0

        while total_size < BUFFER_MAX_SIZE:
            try:
                # Check if data is available without blocking
                readable, _, _ = select.select([self.master_fd], [], [], 0)
                if not readable:
                    break

                chunk = os.read(self.master_fd, READ_CHUNK_SIZE)
                if not chunk:
                    break

                chunks.append(chunk)
                total_size += len(chunk)
            except (OSError, IOError):
                break

        return b"".join(chunks) if chunks else None

    def is_alive(self) -> bool:
        """Check if the process is still running."""
        if self.pid is None:
            return False
        try:
            pid, status = os.waitpid(self.pid, os.WNOHANG)
            if pid == self.pid:
                self.running = False
                return False
            return True
        except ChildProcessError:
            self.running = False
            return False

    def stop(self):
        """Stop the terminal session."""
        self.running = False
        if self.pid:
            try:
                os.kill(self.pid, signal.SIGTERM)
                # Give process time to terminate gracefully
                for _ in range(10):
                    try:
                        pid, _ = os.waitpid(self.pid, os.WNOHANG)
                        if pid == self.pid:
                            break
                    except ChildProcessError:
                        break
                else:
                    # Force kill if still running
                    try:
                        os.kill(self.pid, signal.SIGKILL)
                    except ProcessLookupError:
                        pass
            except (ProcessLookupError, ChildProcessError):
                pass
        if self.master_fd:
            try:
                os.close(self.master_fd)
            except OSError:
                pass
        self.master_fd = None
        self.pid = None


@router.websocket("/ws/session/{task_id}")
async def terminal_session(websocket: WebSocket, task_id: str):
    """
    WebSocket endpoint for interactive terminal sessions.

    Protocol:
    - Client sends JSON: {"type": "input", "data": "..."} for stdin
    - Client sends JSON: {"type": "resize", "rows": N, "cols": N} for resize
    - Server sends JSON: {"type": "output", "data": "..."} for stdout/stderr
    - Server sends JSON: {"type": "exit", "code": N} when process exits
    - Server sends JSON: {"type": "ready", "task_id": "..."} when session starts
    - Server sends JSON: {"type": "error", "message": "..."} on error
    """
    await websocket.accept()

    session = TerminalSession(task_id)

    try:
        # Start the terminal process
        if not session.start():
            await websocket.send_json({"type": "error", "message": "Failed to start session"})
            await websocket.close()
            return

        # Send initial ready message
        await websocket.send_json({"type": "ready", "task_id": task_id})

        async def read_output():
            """Read output from PTY and send to WebSocket with buffering."""
            output_buffer = []
            last_flush_time = time.monotonic()

            while session.running:
                if not session.master_fd:
                    break

                try:
                    # Wait for data with a short timeout
                    readable, _, _ = select.select([session.master_fd], [], [], BUFFER_FLUSH_INTERVAL)

                    if readable:
                        # Read all available data at once
                        data = session.read_all_available()
                        if data:
                            output_buffer.append(data)

                    current_time = time.monotonic()
                    buffer_size = sum(len(chunk) for chunk in output_buffer)
                    time_since_flush = current_time - last_flush_time

                    # Flush buffer if:
                    # 1. Buffer has data AND enough time has passed, OR
                    # 2. Buffer exceeds max size
                    should_flush = output_buffer and (
                        time_since_flush >= BUFFER_FLUSH_INTERVAL or
                        buffer_size >= BUFFER_MAX_SIZE
                    )

                    if should_flush:
                        combined_data = b"".join(output_buffer)
                        output_buffer.clear()
                        last_flush_time = current_time

                        await websocket.send_json({
                            "type": "output",
                            "data": combined_data.decode("utf-8", errors="replace"),
                        })

                except (ValueError, OSError):
                    break

                # Check if process is still alive
                if not session.is_alive():
                    # Flush any remaining buffered output
                    if output_buffer:
                        combined_data = b"".join(output_buffer)
                        await websocket.send_json({
                            "type": "output",
                            "data": combined_data.decode("utf-8", errors="replace"),
                        })
                    await websocket.send_json({"type": "exit", "code": 0})
                    break

        async def handle_input():
            """Handle input from WebSocket."""
            while session.running:
                try:
                    message = await asyncio.wait_for(
                        websocket.receive_json(), timeout=0.1
                    )
                    msg_type = message.get("type")

                    if msg_type == "input":
                        data = message.get("data", "")
                        if data:
                            session.write(data.encode("utf-8"))

                    elif msg_type == "resize":
                        rows = message.get("rows", 24)
                        cols = message.get("cols", 80)
                        session.resize(rows, cols)

                    elif msg_type == "stop":
                        session.stop()
                        break

                except asyncio.TimeoutError:
                    continue
                except WebSocketDisconnect:
                    break
                except Exception:
                    # Handle other exceptions gracefully
                    break

        # Run both tasks concurrently
        await asyncio.gather(read_output(), handle_input(), return_exceptions=True)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        session.stop()
        try:
            await websocket.close()
        except Exception:
            pass
