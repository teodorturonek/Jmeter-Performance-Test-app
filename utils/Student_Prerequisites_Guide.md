# Student Prerequisites Guide
### Introduction to JMeter Performance Testing

Please complete all steps below **before arriving at the session**. The first exercise begins immediately — there will be no time to install software on the day.

If you run into any issues, contact your trainer in advance.

---

## Option A — Docker (Recommended, simpler)

You only need two things:

| Software | Version | Download |
|----------|---------|----------|
| Docker Desktop | Latest | https://www.docker.com/products/docker-desktop/ |
| Apache JMeter | 5.6+ | https://jmeter.apache.org/download_jmeter.cgi |
| Java (JDK or JRE) | 11+ | https://adoptium.net/ |
| Firefox | Latest | https://www.mozilla.org/firefox/ |

> Java is required to run JMeter. Docker Desktop bundles everything needed for the demo app.

### Setup steps

1. Install Docker Desktop and start it — confirm the whale icon appears in your taskbar/menu bar
2. Install Java — open a terminal and run `java -version` to confirm
3. Download JMeter — extract the zip/tar to a folder you can find easily (e.g. `C:\JMeter` or `~/JMeter`)
4. Start JMeter:
   - **Windows:** double-click `bin\jmeter.bat`
   - **Mac/Linux:** run `bin/jmeter.sh` from terminal
5. Clone or download the course materials folder provided by your trainer
6. Open a terminal in the course materials folder and run:
   ```
   docker compose up --build
   ```
7. Wait for the message: `Server is running on port 3000`

---

## Option B — Native Install (Node.js + PostgreSQL)

Use this if you cannot run Docker.

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 20+ | https://nodejs.org/ |
| PostgreSQL | 16 | https://www.postgresql.org/download/ |
| Git | Any | https://git-scm.com/ |
| Apache JMeter | 5.6+ | https://jmeter.apache.org/download_jmeter.cgi |
| Java (JDK or JRE) | 11+ | https://adoptium.net/ |
| Firefox | Latest | https://www.mozilla.org/firefox/ |

### Setup steps

1. Install all software listed above
2. Open a terminal in the course materials folder and run:
   - **Mac/Linux:** `./setup.sh`
   - **Windows (PowerShell as Admin):** `.\setup.ps1`
3. Start the app: `cd backend && npm start`
4. Install and start JMeter as described in Option A steps 2–4

---

## Environment Requirements

| Requirement | Detail |
|-------------|--------|
| RAM | 8 GB minimum, 16 GB recommended |
| Disk space | 2 GB free (Docker images + JMeter) |
| Network | Localhost only — no internet required during the session |
| Ports | 3000 (native) and 80 (Docker) must be free |
| Browser | Firefox (required for JMeter recording), Chrome optional |
| Screen | Two windows side by side is helpful (JMeter + browser) |

> **Check your ports are free before the session:**
>
> **Mac/Linux** — run these in a terminal:
> ```
> lsof -i :3000
> lsof -i :80
> ```
> If nothing is returned, the port is free. If a process is listed, note the name and quit that application.
>
> **Windows** — run these in PowerShell or Command Prompt:
> ```
> netstat -ano | findstr :3000
> netstat -ano | findstr :80
> ```
> If nothing is returned, the port is free. If a line is returned, find the PID in Task Manager and end that process.

---

## Optional — VS Code Extensions

If you have [VS Code](https://code.visualstudio.com/) installed, these extensions are useful for exploring the demo app during the session:

| Extension | Publisher | Purpose | Install |
|-----------|-----------|---------|--------|
| PostgreSQL | Chris Kolkman | Browse and query the database directly from VS Code | Search `PostgreSQL` in Extensions panel |

> Both are optional. The PostgreSQL extension requires the database to be running (Option B native install only — Docker exposes the DB on port 5432 too).
>
> Connection details for the PostgreSQL extension:
> - Host: `localhost` · Port: `5432` · Database: `tasks_db` · User: `tasks_user` · Password: `tasks_pass`

---

## Pre-Session Verification Checklist

Work through each item and tick it off before the session. Items 1–7 must pass. Item 8 is optional.

| # | Check | How to verify | Expected result |
|---|-------|--------------|-----------------|
| 1 | Java is installed | Run `java -version` in a terminal | Version 11 or higher shown |
| 2 | JMeter launches | Double-click `bin\jmeter.bat` (Windows) or run `bin/jmeter.sh` (Mac/Linux) | JMeter GUI opens with no errors |
| 3 | Firefox is installed | Open Firefox | Browser opens — version shown in Help → About Firefox |
| 4 | Node.js installed *(native only)* | Run `node -v` in a terminal | `v20.x.x` or higher |
| 5 | PostgreSQL running *(native only)* | Run `psql -U tasks_user -d tasks_db -h localhost -c "\l"` | Lists databases without error |
| 6 | Demo app starts | Run `docker compose up` or `cd backend && npm start` | Terminal shows `Server is running on port 3000` |
| 7 | Demo app loads in browser | Open `http://localhost` (Docker) or `http://localhost:3000` (native) | Login page appears — log in with `user1` / `password1` |
| 8 | *(Optional)* VS Code PostgreSQL extension | Open VS Code → Extensions → search `PostgreSQL` → Install, then connect using the details above | Database tables visible in the sidebar |

---

## Quick Reference

| Item | Value |
|------|-------|
| App URL (Docker) | http://localhost |
| App URL (Native) | http://localhost:3000 |
| Swagger UI (Docker) | http://localhost/api-docs |
| Swagger UI (Native) | http://localhost:3000/api-docs |
| Test login | username: `user1` / password: `password1` |

---

*If any step fails, note the error message and contact your trainer before the session day.*
