# ATW Web UI

Web application for Atlas Task Workflow - a mobile-responsive interface for managing tasks from anywhere.

## Features

- **Kanban Board** - 4-column workflow view (Planning, Queued, Running, Review)
- **Tasks List** - Searchable/filterable table view
- **Projects** - Project management and filtering
- **Workflow** - Executor monitoring and control
- **Sync** - Data synchronization with Odoo

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), wrapping ATW CLI
- **State**: React Query + Zustand

## Prerequisites

- Node.js 18+
- Python 3.10+
- [uv](https://github.com/astral-sh/uv) (recommended) or pip
- ATW CLI installed and configured

## Quick Start

### Option 1: Full Installation (Recommended)

```bash
cd ~/Proyectos/atw-web-ui
./scripts/install.sh
```

This will:
- Install system dependencies (Ubuntu only)
- Set up Python venv and install backend dependencies
- Install npm packages and build the frontend

### Option 2: Development Mode

```bash
./scripts/dev.sh
```

Starts both servers with hot-reload for development.

### Option 3: Production Mode

```bash
./scripts/start.sh       # Start in background
./scripts/start.sh -f    # Start in foreground
./scripts/stop.sh        # Stop all services
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Deployment on Ubuntu Server

### 1. Clone and Install

```bash
git clone <repo-url> ~/atw-web-ui
cd ~/atw-web-ui
./scripts/install.sh
```

### 2. Install as System Service (auto-start on boot)

```bash
sudo ./scripts/install-service.sh
```

### 3. Manage Services

```bash
# Start
sudo systemctl start atw-web-backend atw-web-frontend

# Stop
sudo systemctl stop atw-web-frontend atw-web-backend

# Status
sudo systemctl status atw-web-backend atw-web-frontend

# Logs
journalctl -u atw-web-backend -f
tail -f ~/atw-web-ui/logs/backend.log
```

### 4. Uninstall Services

```bash
sudo ./scripts/uninstall-service.sh
```

## Manual Setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi "uvicorn[standard]" pydantic pydantic-settings
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # Development
npm run build    # Build for production
npm start        # Production server
```

## Project Structure

```
atw-web-ui/
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   └── (dashboard)/   # Dashboard route group
│   │   ├── components/        # React components
│   │   ├── hooks/             # React Query hooks
│   │   ├── lib/               # Utilities, API client
│   │   └── types/             # TypeScript types
│   └── package.json
│
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── api/routes/        # REST endpoints
│   │   ├── services/          # ATW CLI wrapper
│   │   └── main.py
│   └── pyproject.toml
│
└── scripts/                    # Deployment scripts
    ├── install.sh              # Full installation
    ├── dev.sh                  # Development mode
    ├── start.sh                # Production start
    ├── stop.sh                 # Stop services
    ├── install-service.sh      # Install systemd services
    ├── uninstall-service.sh    # Remove systemd services
    └── systemd/                # Service file templates
```

## API Endpoints

### Tasks
- `GET /api/tasks` - List tasks
- `GET /api/tasks/dashboard` - Kanban data
- `GET /api/tasks/summary` - Statistics
- `POST /api/tasks/{id}/approve` - Approve task
- `POST /api/tasks/{id}/reset` - Reset to REDO

### Workflow
- `GET /api/executor/status` - Executor status
- `POST /api/executor/start` - Start executor
- `GET /api/workflow/queue` - Queue status

### Projects
- `GET /api/projects` - List projects

### Sync
- `POST /api/sync/data` - Sync data
- `POST /api/sync/tasks` - Sync from Odoo

## 9-State Task Lifecycle

```
new → ready → running → review → conclude → done
      ↓        ↓
    approve   blocked
      ↓
    ready

reset → redo → ready (after reimport)
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend
```
ATW_WEB_DEBUG=true
ATW_WEB_ATW_COMMAND=atw
```

## License

Private - Atlas Work Project
