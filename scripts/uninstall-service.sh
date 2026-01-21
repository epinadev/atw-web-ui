#!/bin/bash
# Uninstall systemd services for ATW Web UI
# Run with: sudo ./scripts/uninstall-service.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run with sudo: sudo ./scripts/uninstall-service.sh"
    exit 1
fi

SYSTEMD_DIR="/etc/systemd/system"

echo -e "${YELLOW}Uninstalling ATW Web UI services...${NC}"

# Stop services
log_info "Stopping services..."
systemctl stop atw-web-frontend.service 2>/dev/null || true
systemctl stop atw-web-backend.service 2>/dev/null || true

# Disable services
log_info "Disabling services..."
systemctl disable atw-web-frontend.service 2>/dev/null || true
systemctl disable atw-web-backend.service 2>/dev/null || true

# Remove service files
log_info "Removing service files..."
rm -f "$SYSTEMD_DIR/atw-web-backend.service"
rm -f "$SYSTEMD_DIR/atw-web-frontend.service"

# Reload systemd
systemctl daemon-reload

echo ""
log_success "Services uninstalled"
