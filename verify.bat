@echo off
echo ========================================
echo HACK-THE-BOX Platform Verification
echo ========================================
echo.

echo [1/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://docker.com
    pause
    exit /b 1
)
echo OK: Docker is installed

echo.
echo [2/5] Checking Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not available
    pause
    exit /b 1
)
echo OK: Docker Compose is available

echo.
echo [3/5] Checking .env file...
if not exist ".env" (
    echo WARNING: .env file not found
    echo Creating from .env.example...
    copy .env.example .env
)
echo OK: .env file exists

echo.
echo [4/5] Checking project structure...
if not exist "apps\backend" (
    echo ERROR: Backend directory not found
    pause
    exit /b 1
)
if not exist "apps\frontend" (
    echo ERROR: Frontend directory not found
    pause
    exit /b 1
)
if not exist "docker-compose.yml" (
    echo ERROR: docker-compose.yml not found
    pause
    exit /b 1
)
echo OK: Project structure is valid

echo.
echo [5/5] Checking ports...
netstat -an | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port 3000 is already in use
)
netstat -an | findstr ":3001" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port 3001 is already in use
)
netstat -an | findstr ":5432" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port 5432 is already in use
)

echo.
echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo To start the platform, run:
echo   docker compose up --build
echo.
echo Then access:
echo   Frontend: http://localhost:3000
echo   Admin Login: admin@hackthebox.local / admin123
echo.
pause
