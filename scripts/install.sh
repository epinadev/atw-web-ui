#!/bin/bash
# Full installation script for ATW Web UI
# Works on both macOS (dev) and Ubuntu (production)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OS="$(uname -s)"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════╗"
echo "║      ATW Web UI - Installation Script     ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Detect OS
if [[ "$OS" == "Linux" ]]; then
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
    fi
    log_info "Detected: Linux ($DISTRO)"
elif [[ "$OS" == "Darwin" ]]; then
    log_info "Detected: macOS"
    DISTRO="macos"
else
    log_error "Unsupported OS: $OS"
    exit 1
fi

# Install system dependencies on Ubuntu
if [[ "$DISTRO" == "ubuntu" ]] || [[ "$DISTRO" == "debian" ]]; then
    log_info "Installing system dependencies..."

    sudo apt-get update
    sudo apt-get install -y \
        curl \
        git \
        python3 \
        python3-venv \
        python3-pip \
        build-essential

    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        log_info "Installing Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi

    log_success "System dependencies installed"
fi

# Check prerequisites
log_info "Checking prerequisites..."

check_command() {
    if command -v "$1" &> /dev/null; then
        log_success "$1 found: $($1 --version 2>/dev/null | head -1)"
        return 0
    else
        log_error "$1 not found"
        return 1
    fi
}

check_command node || exit 1
check_command npm || exit 1
check_command python3 || exit 1

# Check for atw command
if command -v atw &> /dev/null; then
    log_success "atw CLI found"
else
    log_warn "atw CLI not found - backend will have limited functionality"
fi

# Setup backend
echo ""
log_info "Setting up Python backend..."
cd "$PROJECT_ROOT/backend"

if [ ! -d ".venv" ]; then
    log_info "Creating virtual environment..."
    python3 -m venv .venv
fi

log_info "Installing Python dependencies..."
source .venv/bin/activate
pip install --upgrade pip -q
pip install fastapi "uvicorn[standard]" pydantic pydantic-settings python-dotenv -q

log_success "Backend setup complete"

# Setup frontend
echo ""
log_info "Setting up Next.js frontend..."
cd "$PROJECT_ROOT/frontend"

log_info "Installing npm dependencies..."
npm install --silent

log_success "Frontend dependencies installed"

# Build frontend for production
echo ""
log_info "Building frontend for production..."
npm run build

log_success "Frontend build complete"

# Create .env files if they don't exist
echo ""
log_info "Setting up environment files..."

if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    cat > "$PROJECT_ROOT/backend/.env" << EOF
ATW_WEB_DEBUG=false
ATW_WEB_ATW_COMMAND=atw
EOF
    log_success "Created backend/.env"
fi

if [ ! -f "$PROJECT_ROOT/frontend/.env.local" ]; then
    cat > "$PROJECT_ROOT/frontend/.env.local" << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    log_success "Created frontend/.env.local"
fi

# Summary
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════╗"
echo "║        Installation Complete!             ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Next steps:"
echo ""
echo "  1. Start in development mode:"
echo "     ${YELLOW}./scripts/dev.sh${NC}"
echo ""
echo "  2. Start in production mode:"
echo "     ${YELLOW}./scripts/start.sh${NC}"
echo ""
echo "  3. Install as systemd service (Linux only):"
echo "     ${YELLOW}sudo ./scripts/install-service.sh${NC}"
echo ""
