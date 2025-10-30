@echo off
title DeepFake Detector - First Time Setup on New PC
color 0A

echo ========================================
echo   DeepFake Detector - New PC Setup
echo ========================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] Not running as Administrator
    echo Some installations may require admin rights
    echo.
    pause
)

:: Check if already configured
if exist "backend\.env" (
    echo [INFO] Configuration found. Starting application...
    echo.
    goto :start_app
)

:: Check if .env.example exists (for GitHub users)
if not exist "backend\.env.example" (
    echo [ERROR] This appears to be an incomplete download
    echo Please ensure you have all project files
    pause
    exit /b 1
)

echo [STEP 1/5] Checking Python installation...
set PYTHON_CMD=
py --version >nul 2>&1
if %errorLevel% equ 0 (
    set PYTHON_CMD=py
    echo [OK] Python found (py command)
    goto :python_found
)
python --version >nul 2>&1
if %errorLevel% equ 0 (
    set PYTHON_CMD=python
    echo [OK] Python found (python command)
    goto :python_found
)
python3 --version >nul 2>&1
if %errorLevel% equ 0 (
    set PYTHON_CMD=python3
    echo [OK] Python found (python3 command)
    goto :python_found
)
echo [ERROR] Python not found!
echo Please install Python 3.8+ from: https://www.python.org/downloads/
echo Make sure to check "Add Python to PATH" during installation
pause
exit /b 1
:python_found
echo.

echo [STEP 2/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js 16+ from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found
echo.

echo [STEP 3/5] Installing backend dependencies...
cd backend
if not exist "requirements.txt" (
    echo [ERROR] requirements.txt not found!
    cd ..
    pause
    exit /b 1
)
%PYTHON_CMD% -m pip install -r requirements.txt
if %errorLevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Backend dependencies installed
echo.

echo [STEP 4/5] Installing frontend dependencies...
cd frontend
if not exist "package.json" (
    echo [ERROR] package.json not found!
    cd ..
    pause
    exit /b 1
)
call npm install
if %errorLevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend dependencies installed
echo.

echo [STEP 5/5] Configuration Setup
echo ========================================
echo.
echo IMPORTANT: You need to create accounts for:
echo 1. MongoDB Atlas (free): https://www.mongodb.com/atlas
echo 2. Gmail App Password: https://support.google.com/accounts/answer/185833
echo 3. Cloudinary (free): https://cloudinary.com/
echo.
echo Please enter your configuration details:
echo (Leave blank and press Enter to use defaults for testing)
echo.

:: Create backend .env file
echo Creating backend configuration...
set /p MONGODB_URI="MongoDB URI (or press Enter for local): "
if "%MONGODB_URI%"=="" set MONGODB_URI=mongodb://localhost:27017/deepfake_detector

set /p SMTP_EMAIL="Gmail Email (or press Enter to skip): "
if "%SMTP_EMAIL%"=="" set SMTP_EMAIL=your_email@gmail.com

set /p SMTP_PASSWORD="Gmail App Password (or press Enter to skip): "
if "%SMTP_PASSWORD%"=="" set SMTP_PASSWORD=your_app_password

set /p CLOUDINARY_CLOUD_NAME="Cloudinary Cloud Name (or press Enter to skip): "
if "%CLOUDINARY_CLOUD_NAME%"=="" set CLOUDINARY_CLOUD_NAME=your_cloud_name

set /p CLOUDINARY_API_KEY="Cloudinary API Key (or press Enter to skip): "
if "%CLOUDINARY_API_KEY%"=="" set CLOUDINARY_API_KEY=your_api_key

set /p CLOUDINARY_API_SECRET="Cloudinary API Secret (or press Enter to skip): "
if "%CLOUDINARY_API_SECRET%"=="" set CLOUDINARY_API_SECRET=your_api_secret

:: Generate random JWT secret
set JWT_SECRET=%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%

(
echo # Database
echo MONGODB_URI=%MONGODB_URI%
echo.
echo # Email Service
echo SMTP_EMAIL=%SMTP_EMAIL%
echo SMTP_PASSWORD=%SMTP_PASSWORD%
echo.
echo # Cloudinary
echo CLOUDINARY_CLOUD_NAME=%CLOUDINARY_CLOUD_NAME%
echo CLOUDINARY_API_KEY=%CLOUDINARY_API_KEY%
echo CLOUDINARY_API_SECRET=%CLOUDINARY_API_SECRET%
echo.
echo # Security
echo JWT_SECRET=%JWT_SECRET%
echo SECRET_KEY=%JWT_SECRET%
echo.
echo # Server
echo PORT=8000
echo FLASK_ENV=production
) > backend\.env

echo [OK] Backend configuration created
echo.

:: Create frontend .env file
(
echo REACT_APP_API_URL=http://localhost:8000
) > frontend\.env

echo [OK] Frontend configuration created
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.

:start_app
echo Starting DeepFake Detector...
echo.
echo Backend will start on: http://localhost:8000
echo Frontend will start on: http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.
pause

:: Start backend in new window
start "DeepFake Detector - Backend" cmd /k "cd backend && %PYTHON_CMD% app_new.py"

:: Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

:: Start frontend in new window
start "DeepFake Detector - Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Application Started!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Two new windows have opened for backend and frontend
echo Close those windows to stop the servers
echo.
echo This window can be closed safely
echo.
pause
exit
