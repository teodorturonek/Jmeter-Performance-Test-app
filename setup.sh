#!/bin/bash

# JMeter Training App Setup Script
# Automates backend and frontend setup

echo "🚀 JMeter Training App Setup"
echo "============================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed"
  echo "Please install from: https://nodejs.org/"
  exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend Server..."
cd server

if [ ! -f ".env" ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
fi

echo "Installing dependencies..."
npm install

echo ""
echo "✓ Backend setup complete!"
echo ""

# Setup Frontend
echo "🎨 Setting up Frontend..."
cd ../frontend

echo "Frontend is ready to serve!"
echo ""

cd ..

echo "=============================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Start Backend Server:"
echo "   cd server"
echo "   npm run seed    # (first time only)"
echo "   npm start"
echo ""
echo "2. Start Frontend (in another terminal):"
echo "   cd frontend"
echo ""
echo "   # Option A: Python 3"
echo "   python3 -m http.server 3000"
echo ""
echo "   # Option B: Node.js"
echo "   npx http-server public -p 3000"
echo ""
echo "3. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "4. Login with:"
echo "   Email: alice@example.com"
echo "   Password: password123"
echo ""
echo "📚 For JMeter testing guide, see jmeter-scripts/README.md"
echo "=============================="
