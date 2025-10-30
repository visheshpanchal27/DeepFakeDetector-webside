@echo off
title DeepFake Detector - Quick Start
color 0A

echo ========================================
echo   DeepFake Detector - Quick Start
echo ========================================
echo.

:: Check if .env exists
if not exist "backend\.env" (
    echo [INFO] First time setup required
    echo Running complete setup...
    echo.
    call FIRST_TIME_SETUP.bat
    exit /b
)

echo [INFO] Configuration found. Starting application...
echo.

:: Determine Python command
set PYTHON_CMD=py
py --version >nul 2>&1
if %errorLevel% neq 0 (
    set PYTHON_CMD=python
    python --version >nul 2>&1
    if %errorLevel% neq 0 (
        set PYTHON_CMD=python3
    )
)

echo Starting servers...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in server windows to stop
echo.

:: Start backend
start "Backend Server" cmd /k "cd backend && %PYTHON_CMD% app_new.py"

:: Wait and start frontend
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Two new windows opened for servers
echo This window can be closed
echo.
pause