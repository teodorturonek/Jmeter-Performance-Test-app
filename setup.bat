@echo off
REM JMeter Training App Setup Script for Windows

echo.
echo 🚀 JMeter Training App Setup
echo ============================
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Node.js is not installed
  echo Please install from: https://nodejs.org/
  exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js version: %NODE_VERSION%
echo.

REM Setup Backend
echo 📦 Setting up Backend Server...
cd server

if not exist ".env" (
  echo Creating .env file from .env.example...
  copy .env.example .env
)

echo Installing dependencies...
call npm install

echo.
echo ✓ Backend setup complete!
echo.

REM Setup Frontend
echo 🎨 Setting up Frontend...
cd ..\frontend

echo Frontend is ready to serve!
echo.

cd ..

echo ==============================
echo ✅ Setup Complete!
echo.
echo Next steps:
echo.
echo 1. Start Backend Server:
echo    cd server
echo    npm run seed    (first time only)
echo    npm start
echo.
echo 2. Start Frontend (in another terminal):
echo    cd frontend
echo.
echo    Option A: Node.js
echo    npx http-server public -p 3000
echo.
echo    Option B: Python 3
echo    python -m http.server 3000
echo.
echo 3. Open browser:
echo    http://localhost:3000
echo.
echo 4. Login with:
echo    Email: alice@example.com
echo    Password: password123
echo.
echo 📚 For JMeter testing guide, see jmeter-scripts/README.md
echo ==============================
pause
