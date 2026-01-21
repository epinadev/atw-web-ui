#!/bin/bash
# Production start script - starts both frontend and backend
# Use ./scripts/dev.sh for development with hot-reload

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$PROJECT_ROOT/.pids"
LOG_DIR="$PROJECT_ROOT/logs"

# Create directories
mkdir -p "$PID_DIR" "$LOG_DIR"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse arguments
FOREGROUND=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--foreground)
            FOREGROUND=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════╗"
echo "║     ATW Web UI - Production Mode          ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Check if already running
if [ -f "$PID_DIR/backend.pid" ]; then
    OLD_PID=$(cat "$PID_DIR/backend.pid")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        log_error "Backend already running (PID: $OLD_PID)"
        log_info "Run ./scripts/stop.sh first"
        exit 1
    fi
fi

# Check if frontend is built
if [ ! -d "$PROJECT_ROOT/frontend/.next" ]; then
    log_info "Frontend not built. Building now..."
    cd "$PROJECT_ROOT/frontend"
    npm run build
fi

# Function to cleanup on exit (for foreground mode)
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    "$PROJECT_ROOT/scripts/stop.sh"
    exit 0
}

# Start backend
log_info "Starting FastAPI backend..."
cd "$PROJECT_ROOT/backend"
source .venv/bin/activate

if [ "$FOREGROUND" = true ]; then
    trap cleanup SIGINT SIGTERM
    uvicorn app.main:app --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PID_DIR/backend.pid"
else
    nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 \
        > "$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PID_DIR/backend.pid"
fi

log_success "Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
sleep 2

# Start frontend
log_info "Starting Next.js frontend..."
cd "$PROJECT_ROOT/frontend"

if [ "$FOREGROUND" = true ]; then
    npm start &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
else
    nohup npm start > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
fi

log_success "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo -e "${GREEN}Services are running!${NC}"
echo ""
echo "  Frontend: ${YELLOW}http://localhost:3000${NC}"
echo "  Backend:  ${YELLOW}http://localhost:8000${NC}"
echo "  API Docs: ${YELLOW}http://localhost:8000/docs${NC}"
echo ""

if [ "$FOREGROUND" = true ]; then
    echo "Press Ctrl+C to stop both services."
    echo ""
    wait
else
    echo "Logs:"
    echo "  Backend:  ${YELLOW}$LOG_DIR/backend.log${NC}"
    echo "  Frontend: ${YELLOW}$LOG_DIR/frontend.log${NC}"
    echo ""
    echo "To stop: ${YELLOW}./scripts/stop.sh${NC}"
    echo ""
fi
