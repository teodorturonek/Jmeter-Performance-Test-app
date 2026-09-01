#!/bin/bash
# Setup script for Tasks app (native install, no Docker)
# Prerequisites: PostgreSQL running locally, psql available

set -e

DB_NAME="tasks_db"
DB_USER="tasks_user"
DB_PASS="tasks_pass"

# Detect the PostgreSQL superuser (Homebrew uses current user, Linux uses postgres)
if psql -U postgres -d postgres -c "SELECT 1" >/dev/null 2>&1; then
  PG_SUPER="postgres"
else
  PG_SUPER="$(whoami)"
fi

echo "=== Tasks App Setup ==="
echo "Using PostgreSQL superuser: ${PG_SUPER}"

# Create PostgreSQL user and database
echo "Creating database user and database..."
psql -U "${PG_SUPER}" -d postgres -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" 2>/dev/null || echo "User ${DB_USER} already exists, skipping."
psql -U "${PG_SUPER}" -d postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || echo "Database ${DB_NAME} already exists, skipping."
psql -U "${PG_SUPER}" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

# Run init.sql to create tables and seed data
echo "Creating tables and seeding data..."
PGPASSWORD="${DB_PASS}" psql -U ${DB_USER} -d ${DB_NAME} -h localhost -f db/init.sql

# Install Node.js dependencies
echo "Installing dependencies..."
cd backend
npm install

echo ""
echo "=== Setup complete ==="
echo "Start the app with: cd backend && npm start"
echo "Open http://localhost:3000 in your browser"
