# Setup script for Tasks app (native install, no Docker)
# Prerequisites: PostgreSQL running locally, psql available in PATH
# Run from the repo root: .\setup.ps1

$ErrorActionPreference = "Stop"

$DB_NAME = "tasks_db"
$DB_USER = "tasks_user"
$DB_PASS = "tasks_pass"

Write-Host "=== Tasks App Setup ===" -ForegroundColor Cyan

# Detect PostgreSQL superuser (try postgres first, fall back to current user)
$PG_SUPER = $null
try {
    psql -U postgres -d postgres -c "SELECT 1" 2>$null | Out-Null
    $PG_SUPER = "postgres"
} catch {
    $PG_SUPER = $env:USERNAME
}

Write-Host "Using PostgreSQL superuser: $PG_SUPER"

# Create database user (ignore error if already exists)
Write-Host "Creating database user..."
psql -U $PG_SUPER -d postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>&1 |
    ForEach-Object { if ($_ -match "already exists") { Write-Host "User $DB_USER already exists, skipping." } else { $_ } }

# Create database (ignore error if already exists)
Write-Host "Creating database..."
psql -U $PG_SUPER -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>&1 |
    ForEach-Object { if ($_ -match "already exists") { Write-Host "Database $DB_NAME already exists, skipping." } else { $_ } }

# Grant privileges
psql -U $PG_SUPER -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Run init.sql to create tables and seed data
Write-Host "Creating tables and seeding data..."
$env:PGPASSWORD = $DB_PASS
psql -U $DB_USER -d $DB_NAME -h localhost -f db/init.sql
Remove-Item Env:PGPASSWORD

# Install Node.js dependencies
Write-Host "Installing dependencies..."
Set-Location backend
npm install
Set-Location ..

Write-Host ""
Write-Host "=== Setup complete ===" -ForegroundColor Green
Write-Host "Start the app with: cd backend; npm start"
Write-Host "Open http://localhost:3000 in your browser"
