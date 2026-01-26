#!/bin/bash
# Development script - starts both frontend and backend

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${GREEN}Starting ATW Web UI Development Environment${NC}"
echo "============================================"

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Killing existing processes on port $port...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Clean up ports before starting
echo -e "${YELLOW}Checking for processes on ports 3000 and 8001...${NC}"
kill_port 3000
kill_port 8001
echo -e "${GREEN}Ports are free.${NC}"

# Check if npm is installed for frontend
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: 'npm' is not installed.${NC}"
    exit 1
fi

# Check if backend venv exists
if [ ! -d "$PROJECT_ROOT/backend/.venv" ]; then
    echo -e "${YELLOW}Creating backend virtual environment...${NC}"
    cd "$PROJECT_ROOT/backend"
    python3 -m venv .venv
    source .venv/bin/activate
    pip install fastapi "uvicorn[standard]" pydantic pydantic-settings
fi

# Ensure PATH includes user's local bin (for atw command)
export PATH="$HOME/.local/bin:$PATH"

# Verify atw is available
if ! command -v atw &> /dev/null; then
    echo -e "${RED}Error: 'atw' command not found. Make sure it's installed.${NC}"
    exit 1
fi
echo -e "${GREEN}Found atw at: $(which atw)${NC}"

# Start backend
echo -e "\n${GREEN}Starting FastAPI backend on http://localhost:8001${NC}"
cd "$PROJECT_ROOT/backend"
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo -e "\n${GREEN}Starting Next.js frontend on http://localhost:3000${NC}"
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}Both services are running!${NC}"
echo -e "  Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "  Backend:  ${YELLOW}http://localhost:8001${NC}"
echo -e "  API Docs: ${YELLOW}http://localhost:8001/docs${NC}"
echo -e "\nPress Ctrl+C to stop both services.\n"

# Wait for both processes
wait
