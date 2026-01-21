/**
 * Interactive terminal component using xterm.js.
 * Uses buffered rendering for smooth TUI display.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  onInput?: (data: string) => void;
  onResize?: (rows: number, cols: number) => void;
  terminalRef?: React.MutableRefObject<Terminal | null>;
}

export function XTerminal({ onInput, onResize, terminalRef }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalTermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const callbacksRef = useRef({ onInput, onResize });

  // Update callbacks ref to avoid stale closures
  useEffect(() => {
    callbacksRef.current = { onInput, onResize };
  }, [onInput, onResize]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create terminal instance with optimized settings
    const terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: "#1c1917", // stone-900
        foreground: "#fafaf9", // stone-50
        cursor: "#22c55e", // green-500
        cursorAccent: "#1c1917",
        selectionBackground: "#44403c", // stone-700
        black: "#1c1917",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#fafaf9",
        brightBlack: "#57534e",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#facc15",
        brightBlue: "#60a5fa",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
      },
      allowProposedApi: true,
      // Performance optimizations for TUI rendering
      scrollback: 5000,
    });

    // Create fit addon
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Open terminal in container
    terminal.open(containerRef.current);

    // Small delay to ensure container is properly rendered before fitting
    requestAnimationFrame(() => {
      fitAddon.fit();
      callbacksRef.current.onResize?.(terminal.rows, terminal.cols);
    });

    // Store references
    internalTermRef.current = terminal;
    fitAddonRef.current = fitAddon;
    if (terminalRef) {
      terminalRef.current = terminal;
    }

    // Handle input
    const inputDisposable = terminal.onData((data) => {
      callbacksRef.current.onInput?.(data);
    });

    // Debounced resize handler to prevent excessive resize events
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        if (fitAddonRef.current && containerRef.current) {
          fitAddonRef.current.fit();
          if (internalTermRef.current) {
            callbacksRef.current.onResize?.(
              internalTermRef.current.rows,
              internalTermRef.current.cols
            );
          }
        }
      }, 50);
    };

    // Listen for window resize
    window.addEventListener("resize", handleResize);

    // Create ResizeObserver for container resize
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      inputDisposable.dispose();
      terminal.dispose();
    };
  }, [terminalRef]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-stone-900"
      style={{ minHeight: "400px", padding: "8px" }}
    />
  );
}

/**
 * Hook to get terminal control methods with buffered writing.
 * Batches writes using requestAnimationFrame for smooth TUI rendering.
 */
export function useTerminalWriter() {
  const terminalRef = useRef<Terminal | null>(null);
  const writeBufferRef = useRef<string[]>([]);
  const rafIdRef = useRef<number | null>(null);

  // Flush the write buffer to the terminal
  const flushBuffer = useCallback(() => {
    rafIdRef.current = null;

    if (writeBufferRef.current.length > 0 && terminalRef.current) {
      // Combine all buffered data and write at once
      const data = writeBufferRef.current.join("");
      writeBufferRef.current = [];
      terminalRef.current.write(data);
    }
  }, []);

  // Buffered write - batches writes and flushes on next animation frame
  const write = useCallback(
    (data: string) => {
      writeBufferRef.current.push(data);

      // Schedule a flush if not already scheduled
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(flushBuffer);
      }
    },
    [flushBuffer]
  );

  // Immediate write - bypasses buffer for critical messages
  const writeImmediate = useCallback((data: string) => {
    // Flush any pending buffer first
    if (writeBufferRef.current.length > 0 && terminalRef.current) {
      const bufferedData = writeBufferRef.current.join("");
      writeBufferRef.current = [];
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      terminalRef.current.write(bufferedData);
    }
    // Then write the immediate data
    terminalRef.current?.write(data);
  }, []);

  const writeln = useCallback((data: string) => {
    terminalRef.current?.writeln(data);
  }, []);

  const clear = useCallback(() => {
    // Clear any pending writes
    writeBufferRef.current = [];
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    terminalRef.current?.clear();
  }, []);

  const focus = useCallback(() => {
    terminalRef.current?.focus();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return { terminalRef, write, writeImmediate, writeln, clear, focus };
}
