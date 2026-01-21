#!/bin/bash
# Install systemd services for ATW Web UI (Linux only)
# Run with: sudo ./scripts/install-service.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run with sudo: sudo ./scripts/install-service.sh"
    exit 1
fi

# Check if systemd exists
if ! command -v systemctl &> /dev/null; then
    log_error "systemd not found. This script only works on systemd-based Linux."
    exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SYSTEMD_DIR="/etc/systemd/system"

# Get the actual user (not root)
if [ -n "$SUDO_USER" ]; then
    ACTUAL_USER="$SUDO_USER"
else
    log_error "Could not determine the actual user. Run with sudo."
    exit 1
fi

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════╗"
echo "║   ATW Web UI - Service Installation       ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

log_info "Installing services for user: $ACTUAL_USER"
log_info "Project root: $PROJECT_ROOT"

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"
chown "$ACTUAL_USER:$ACTUAL_USER" "$PROJECT_ROOT/logs"

# Process and install service files
for service in atw-web-backend atw-web-frontend; do
    log_info "Installing $service.service..."

    # Read template and replace placeholders
    sed -e "s|%USER%|$ACTUAL_USER|g" \
        -e "s|%PROJECT_ROOT%|$PROJECT_ROOT|g" \
        "$PROJECT_ROOT/scripts/systemd/$service.service" \
        > "$SYSTEMD_DIR/$service.service"

    log_success "Installed $service.service"
done

# Reload systemd
log_info "Reloading systemd daemon..."
systemctl daemon-reload

# Enable services
log_info "Enabling services..."
systemctl enable atw-web-backend.service
systemctl enable atw-web-frontend.service

log_success "Services enabled"

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "Commands:"
echo ""
echo "  Start services:"
echo "    ${YELLOW}sudo systemctl start atw-web-backend atw-web-frontend${NC}"
echo ""
echo "  Stop services:"
echo "    ${YELLOW}sudo systemctl stop atw-web-frontend atw-web-backend${NC}"
echo ""
echo "  Check status:"
echo "    ${YELLOW}sudo systemctl status atw-web-backend atw-web-frontend${NC}"
echo ""
echo "  View logs:"
echo "    ${YELLOW}journalctl -u atw-web-backend -f${NC}"
echo "    ${YELLOW}journalctl -u atw-web-frontend -f${NC}"
echo ""
echo "  Or check log files:"
echo "    ${YELLOW}tail -f $PROJECT_ROOT/logs/backend.log${NC}"
echo "    ${YELLOW}tail -f $PROJECT_ROOT/logs/frontend.log${NC}"
echo ""
