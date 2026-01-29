#!/bin/bash

echo "========================================"
echo "HACK-THE-BOX Platform Verification"
echo "========================================"
echo ""

echo "[1/5] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    echo "Please install Docker from https://docker.com"
    exit 1
fi
echo "OK: Docker is installed ($(docker --version))"

echo ""
echo "[2/5] Checking Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    if ! command -v docker-compose &> /dev/null; then
        echo "ERROR: Docker Compose is not available"
        exit 1
    fi
fi
echo "OK: Docker Compose is available"

echo ""
echo "[3/5] Checking .env file..."
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found"
    if [ -f ".env.example" ]; then
        echo "Creating from .env.example..."
        cp .env.example .env
    fi
fi
echo "OK: .env file exists"

echo ""
echo "[4/5] Checking project structure..."
if [ ! -d "apps/backend" ]; then
    echo "ERROR: Backend directory not found"
    exit 1
fi
if [ ! -d "apps/frontend" ]; then
    echo "ERROR: Frontend directory not found"
    exit 1
fi
if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml not found"
    exit 1
fi
echo "OK: Project structure is valid"

echo ""
echo "[5/5] Checking ports..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "WARNING: Port 3000 is already in use"
fi
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "WARNING: Port 3001 is already in use"
fi
if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "WARNING: Port 5432 is already in use"
fi

echo ""
echo "========================================"
echo "Verification Complete!"
echo "========================================"
echo ""
echo "To start the platform, run:"
echo "  docker compose up --build"
echo ""
echo "Then access:"
echo "  Frontend: http://localhost:3000"
echo "  Admin Login: admin@hackthebox.local / admin123"
echo ""
