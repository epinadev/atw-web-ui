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

### 1. Setup

```bash
cd ~/Proyectos/atw-web-ui
./scripts/setup.sh
```

### 2. Start Development Servers

```bash
./scripts/dev.sh
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Manual Setup

#### Backend

```bash
cd backend
uv sync  # or: pip install -e ".[dev]"
uv run uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm install @tanstack/react-query zustand axios clsx tailwind-merge lucide-react
npm run dev
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
└── scripts/                    # Development scripts
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
