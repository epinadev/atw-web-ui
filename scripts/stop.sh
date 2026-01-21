#!/bin/bash
# Stop script - stops both frontend and backend services

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$PROJECT_ROOT/.pids"

log_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }

echo -e "${YELLOW}Stopping ATW Web UI services...${NC}"

stop_service() {
    local name=$1
    local pid_file="$PID_DIR/$name.pid"

    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID" 2>/dev/null
            # Wait for process to stop
            for i in {1..10}; do
                if ! kill -0 "$PID" 2>/dev/null; then
                    break
                fi
                sleep 0.5
            done
            # Force kill if still running
            if kill -0 "$PID" 2>/dev/null; then
                kill -9 "$PID" 2>/dev/null
            fi
            log_success "Stopped $name (PID: $PID)"
        else
            log_info "$name not running (stale PID file)"
        fi
        rm -f "$pid_file"
    else
        log_info "$name not running (no PID file)"
    fi
}

# Also kill any orphaned processes on the ports
kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill 2>/dev/null || true
        log_info "Killed processes on port $port"
    fi
}

stop_service "backend"
stop_service "frontend"

# Clean up any orphaned processes
kill_port 8000
kill_port 3000

echo ""
log_success "All services stopped"
