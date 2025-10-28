@echo off
title DeepFake Detector - Quick Start
color 0A

echo ========================================
echo   DeepFake Detector - Quick Start
echo ========================================
echo.

:: Check if configured
if not exist "backend\.env" (
    echo [INFO] First time setup required
    echo Running first-time setup...
    echo.
    call FIRST_TIME_SETUP.bat
    exit /b
)

:: Check if dependencies installed
if not exist "backend\venv" if not exist "frontend\node_modules" (
    echo [INFO] Dependencies not found
    echo Installing dependencies...
    echo.
    
    echo Installing backend dependencies...
    cd backend
    pip install -r requirements.txt
    cd ..
    
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

echo Starting DeepFake Detector...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.

:: Start backend
start "DeepFake Detector - Backend" cmd /k "cd backend && python app_new.py"

:: Wait for backend
timeout /t 5 /nobreak >nul

:: Start frontend
start "DeepFake Detector - Frontend" cmd /k "cd frontend && npm start"

echo.
echo Application started successfully!
echo Two new windows opened - close them to stop servers
echo.
pause
