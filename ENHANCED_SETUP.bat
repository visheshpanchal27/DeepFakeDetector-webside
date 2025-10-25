@echo off
echo ========================================
echo ENHANCED AI DETECTION SETUP
echo ========================================
echo.
echo This script will set up the enhanced AI detection system
echo that can properly detect Gemini and other AI watermarks.
echo.

cd /d "%~dp0"

echo [1/4] Testing enhanced watermark detection...
cd backend
python test_enhanced_detection.py
if %errorlevel% neq 0 (
    echo ERROR: Enhanced detection test failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Checking backend dependencies...
python -c "import cv2, numpy; print('OpenCV and NumPy available')"
if %errorlevel% neq 0 (
    echo Installing required packages...
    pip install opencv-python numpy
)

echo.
echo [3/4] Testing backend server...
echo Starting backend server test...
timeout /t 2 /nobreak > nul
python -c "from app_new import app; print('Backend imports successful')"
if %errorlevel% neq 0 (
    echo ERROR: Backend server test failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo ENHANCED FEATURES ACTIVATED:
echo ========================================
echo ✓ Ultra-sensitive watermark detection
echo ✓ Gemini AI detection
echo ✓ ChatGPT/DALL-E detection  
echo ✓ Multi-method AI analysis
echo ✓ Corner logo detection
echo ✓ Text watermark scanning
echo ✓ Color signature analysis
echo.
echo Your DeepFake detector now has enhanced capabilities!
echo.
echo To start the application:
echo 1. Run: scripts\start.bat
echo 2. Upload your Gemini image - it should now be detected as AI!
echo.
pause