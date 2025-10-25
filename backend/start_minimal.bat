@echo off
echo Starting Minimal DeepFake Detector Backend...
echo.

REM Install minimal requirements
echo Installing minimal requirements...
pip install -r requirements_minimal.txt

REM Start the minimal app
echo Starting Flask server...
python app_minimal.py

pause