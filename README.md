# Tasks — JMeter Training App

A simple task management app designed as a target for JMeter performance testing training. This app is delicate with minumum security, you can break it if you want but we will not help you fix it.

## Option 1: Native Install (recommended)

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 16](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/)

---

### Mac / Linux

#### Quick Start

```bash
git clone <repo-url>
cd JMeterTrainingApp
./setup.sh
cd backend && npm start
```

The setup script creates the database, tables, and seed data. If `setup.sh` doesn't work, run the steps manually:

```bash
# 1. Create PostgreSQL user and database
psql -U postgres -c "CREATE USER tasks_user WITH PASSWORD 'tasks_pass';"
psql -U postgres -c "CREATE DATABASE tasks_db OWNER tasks_user;"

# 2. Create tables and seed data
psql -U tasks_user -d tasks_db -f db/init.sql

# 3. Install dependencies and start
cd backend
npm install
npm start
```

---

### Windows

#### Quick Start

Open PowerShell as Administrator and run:

```powershell
git clone <repo-url>
cd JMeterTrainingApp
.\setup.ps1
cd backend; npm start
```

 If the script doesn't work, run the steps manually:

```powershell
# 1. Create PostgreSQL user and database
psql -U postgres -c "CREATE USER tasks_user WITH PASSWORD 'tasks_pass';"
psql -U postgres -c "CREATE DATABASE tasks_db OWNER tasks_user;"

# 2. Create tables and seed data
$env:PGPASSWORD = "tasks_pass"
psql -U tasks_user -d tasks_db -h localhost -f db/init.sql

# 3. Install dependencies and start
cd backend
npm install
npm start
```

---

### Access

| What | URL |
|------|-----|
| App | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api-docs |

### Stopping the App

Press `Ctrl+C` in the terminal running `npm start`.

If the process is unresponsive (e.g. after a heavy load test):

```bash
kill $(lsof -t -i:3000)
```

---

## Option 2: Docker

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### Quick Start

```bash
git clone <repo-url>
cd JmeterTrainingApp
docker compose up --build
```

### Access

| What | URL |
|------|-----|
| Frontend (via nginx) | http://localhost |
| API (direct) | http://localhost:3000 |
| Swagger UI | http://localhost/api-docs |

### Docker Commands

| Command | What it does |
|---------|-------------|
| `docker compose up --build` | Build and start (first time) |
| `docker compose up` | Start (after first build) |
| `docker compose down` | Stop all containers |
| `docker compose down --rmi all` | Stop and remove all images (full clean) |
| `docker compose logs -f backend` | Watch API request logs live |

---

## Seed Users

The app starts with 5 pre-created users, each with 5 tasks (TASK-001 to TASK-025):

| Username | Password | Tasks |
|----------|----------|-------|
| user1 | password1 | TASK-001 to TASK-005 |
| user2 | password2 | TASK-006 to TASK-010 |
| user3 | password3 | TASK-011 to TASK-015 |
| user4 | password4 | TASK-016 to TASK-020 |
| user5 | password5 | TASK-021 to TASK-025 |

## API Endpoints

### Auth (no token required)

| Method | URL | Body |
|--------|-----|------|
| GET | `/api/auth/csrf` | — |
| POST | `/api/auth/register` | `{ "username": "...", "password": "..." }` |
| POST | `/api/auth/login` | `{ "username": "...", "password": "...", "csrfToken": "..." }` |

**Login Flow (for correlation practice):**
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

**Task ID:** Each task has a unique `task_id` (e.g., `TASK-001`) auto-generated on creation.

**Search:** Use `/api/tasks/search?q=<query>` to search by `task_id` or `description` (case-insensitive).

### Utility

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/health` | No | Returns `{ "status": "ok" }` |
| GET | `/api/slow?delay=2000` | No | Waits `delay` ms (max 10 000) then responds |
| GET | `/api/flaky?error_rate=50` | Yes | Randomly fails — see below |
| POST | `/api/reset-and-reseed` | No | Wipes all data and re-seeds 5 users with 5 tasks each |

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

## Database Credentials

| Setting | Value |
|---------|-------|
| Host | localhost (or `db` from within Docker) |
| Port | 5432 |
| Database | tasks_db |
| User | tasks_user |
| Password | tasks_pass |

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
