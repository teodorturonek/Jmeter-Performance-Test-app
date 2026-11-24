# Tasks — JMeter Training App

A simple task management app built as a target for JMeter performance testing training. It is intentionally lightweight with minimal security — designed to be tested hard.

---

## Option 1: Native Install

### Prerequisites

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 20+ | https://nodejs.org/ |
| PostgreSQL | 16 | https://www.postgresql.org/download/ |
| Git | Any | https://git-scm.com/ |

---

### Mac

#### Quick Start

```bash
git clone <repo-url>
cd JMeterTrainingApp
./setup.sh
cd backend && npm start
```

The setup script creates the database user, tables, and seed data, then installs Node.js dependencies.

> **Homebrew PostgreSQL note:** Homebrew installs PostgreSQL with your macOS username as the superuser, not `postgres`. If `psql -U postgres` fails, try `psql -U $(whoami)` instead. The `setup.sh` script detects this automatically.

If the script fails, run the steps manually:

```bash
# Create user and database
psql -U postgres -c "CREATE USER tasks_user WITH PASSWORD 'tasks_pass';"
psql -U postgres -c "CREATE DATABASE tasks_db OWNER tasks_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE tasks_db TO tasks_user;"

# Create tables and seed data
PGPASSWORD="tasks_pass" psql -U tasks_user -d tasks_db -h localhost -f db/init.sql

# Install dependencies
cd backend && npm install
```

**Verify PostgreSQL is running before setup:**
```bash
pg_isready
# Expected: /tmp/.s.PGSQL.5432 - accepting connections
```

---

### Windows

#### Quick Start

Open **PowerShell as Administrator** (right-click PowerShell → Run as Administrator) and run:

```powershell
git clone <repo-url>
cd JMeterTrainingApp
.\setup.ps1
cd backend; npm start
```

The setup script creates the database user, tables, and seed data, then installs Node.js dependencies.

> **PostgreSQL PATH note:** After installing PostgreSQL, add `C:\Program Files\PostgreSQL\16\bin` to your system PATH so `psql` is available in PowerShell. Open a new PowerShell window after updating PATH.

If the script fails, run the steps manually in PowerShell as Administrator:

```powershell
# Create user and database (enter your postgres password when prompted)
psql -U postgres -c "CREATE USER tasks_user WITH PASSWORD 'tasks_pass';"
psql -U postgres -c "CREATE DATABASE tasks_db OWNER tasks_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE tasks_db TO tasks_user;"

# Create tables and seed data
$env:PGPASSWORD = "tasks_pass"
psql -U tasks_user -d tasks_db -h localhost -f db/init.sql

# Install dependencies
cd backend
npm install
```

---

### Access (Native)

| What | URL |
|------|-----|
| App | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api-docs |

### Stopping the App (Native)

Press `Ctrl+C` in the terminal running `npm start`.

If the process is unresponsive after a heavy load test:

**Mac/Linux:**
```bash
kill $(lsof -t -i:3000)
```

**Windows (PowerShell):**
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

---

## Option 2: Docker

### Prerequisites

| Software | Download |
|----------|----------|
| Docker Desktop | https://www.docker.com/products/docker-desktop/ |
| Git | https://git-scm.com/ |

Docker Desktop bundles everything needed — no separate Node.js or PostgreSQL install required.

### Quick Start

```bash
git clone <repo-url>
cd JMeterTrainingApp
docker compose up --build
```

> **Windows:** During Docker Desktop install, ensure **WSL 2** is selected when prompted. Restart your machine if required before running the above.

### Access (Docker)

| What | URL |
|------|-----|
| Frontend (via nginx) | http://localhost |
| API (direct) | http://localhost:3000 |
| Swagger UI | http://localhost/api-docs |

### Docker Commands

| Command | What it does |
|---------|-------------|
| `docker compose up --build` | Build and start (first time or after code changes) |
| `docker compose up` | Start (after first build) |
| `docker compose down` | Stop all containers |
| `docker compose down --rmi all` | Stop and remove all images (full clean) |
| `docker compose logs -f backend` | Watch API request logs live |

---

## Verifying Your Setup

| Check | How | Expected result |
|-------|-----|-----------------|
| App is up | Open http://localhost (Docker) or http://localhost:3000 (native) | Login page appears |
| API is healthy | Open http://localhost/health or http://localhost:3000/health | `{"status":"ok"}` |
| Swagger UI works | Open http://localhost/api-docs or http://localhost:3000/api-docs | Swagger UI loads |
| Login works | Log in with `user1` / `password1` | Task list appears |

**Check ports are free before starting:**

Mac/Linux:
```bash
lsof -i :3000
lsof -i :80
```

Windows (PowerShell):
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :80
```

No output means the port is free. If a process is listed, quit that application before starting the app.

---

## Resetting the Database

To wipe all data and re-seed the original 10 users and 50 tasks:

```bash
curl -X POST http://localhost:3000/api/reset-and-reseed
```

---

## Seed Users

The app starts with 10 pre-created users, each with 5 tasks (TASK-001 to TASK-050):

| Username | Password | Tasks |
|----------|----------|-------|
| user1 | password1 | TASK-001 to TASK-005 |
| user2 | password2 | TASK-006 to TASK-010 |
| user3 | password3 | TASK-011 to TASK-015 |
| user4 | password4 | TASK-016 to TASK-020 |
| user5 | password5 | TASK-021 to TASK-025 |
| user6 | password6 | TASK-026 to TASK-030 |
| user7 | password7 | TASK-031 to TASK-035 |
| user8 | password8 | TASK-036 to TASK-040 |
| user9 | password9 | TASK-041 to TASK-045 |
| user10 | password10 | TASK-046 to TASK-050 |

---

## API Endpoints

### Auth (no token required)

| Method | URL | Body |
|--------|-----|------|
| GET | `/api/auth/csrf` | — |
| POST | `/api/auth/register` | `{ "username": "...", "password": "..." }` |
| POST | `/api/auth/login` | `{ "username": "...", "password": "...", "csrfToken": "..." }` |

**Login Flow:**
1. `GET /api/auth/csrf` → returns `{ "csrfToken": "abc123..." }`
2. Extract `csrfToken` from response
3. `POST /api/auth/login` with `csrfToken` in body → returns `{ "token": "...", "user": {...} }`

### Tasks (requires `Authorization: Bearer <token>` header)

| Method | URL | Body |
|--------|-----|------|
| GET | `/api/tasks?page=1` | — |
| GET | `/api/tasks/search?q=...` | — |
| GET | `/api/tasks/:task_id` | — |
| POST | `/api/tasks` | `{ "description": "...", "due_date": "YYYY-MM-DD", "status": "active" }` |
| PUT | `/api/tasks/:task_id` | `{ "description": "...", "due_date": "YYYY-MM-DD", "status": "active" }` |
| DELETE | `/api/tasks/:task_id` | — |

**Task ID:** Each task has a unique `task_id` (e.g. `TASK-001`) auto-generated on creation.

**Search:** Use `/api/tasks/search?q=<query>` to search by `task_id` or `description` (case-insensitive).

### Utility

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/health` | No | Returns `{ "status": "ok" }` |
| GET | `/api/slow?delay=2000` | No | Waits `delay` ms (max 10,000) then responds |
| GET | `/api/flaky?error_rate=50` | Yes | Randomly fails — see below |
| POST | `/api/reset-and-reseed` | No | Wipes all data and re-seeds 10 users with 50 tasks |

#### `/api/flaky`

Simulates an unreliable endpoint for error-handling exercises.

| Parameter | Type | Default | Behaviour |
|-----------|------|---------|-----------|
| `error_rate` | integer 0–100 | `50` | % chance the request fails. Invalid or out-of-range values → `100` |

On **error** (random from `500 / 503 / 429`):
```json
{ "error": true, "message": "Simulated error (status 503)" }
```

On **success**:
```json
{ "status": "ok", "error_rate": 50 }
```

---

## Database Credentials

| Setting | Value |
|---------|-------|
| Host | `localhost` (or `db` from within Docker) |
| Port | `5432` |
| Database | `tasks_db` |
| User | `tasks_user` |
| Password | `tasks_pass` |

---

## Architecture

### Native
```
┌──────────────────┐      ┌──────────┐
│     Express      │─────>│ Postgres │
│     :3000        │      │  :5432   │
│ frontend + API   │      │    db    │
└──────────────────┘      └──────────┘
```

### Docker
```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  nginx   │─────>│ Express  │─────>│ Postgres │
│  :80     │ /api │  :3000   │      │  :5432   │
│ frontend │      │ backend  │      │    db    │
└──────────┘      └──────────┘      └──────────┘
```
