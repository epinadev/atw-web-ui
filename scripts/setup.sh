#!/bin/bash
# Initial setup script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${GREEN}Setting up ATW Web UI${NC}"
echo "========================"

# Setup backend
echo -e "\n${YELLOW}Setting up Python backend...${NC}"
cd "$PROJECT_ROOT/backend"

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

echo "Installing Python dependencies..."
source .venv/bin/activate
pip install --upgrade pip
pip install fastapi "uvicorn[standard]" pydantic pydantic-settings

# Setup frontend
echo -e "\n${YELLOW}Setting up Next.js frontend...${NC}"
cd "$PROJECT_ROOT/frontend"
npm install

# Install additional frontend dependencies
echo -e "\n${YELLOW}Installing additional frontend packages...${NC}"
npm install @tanstack/react-query zustand axios clsx tailwind-merge lucide-react

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "Run ${YELLOW}./scripts/dev.sh${NC} to start development servers."
