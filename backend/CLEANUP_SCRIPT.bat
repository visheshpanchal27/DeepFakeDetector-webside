@echo off
echo ========================================
echo Backend Cleanup Script
echo ========================================
echo.

echo [1/6] Backing up current backend...
xcopy /E /I /Y backend backend_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%

echo.
echo [2/6] Removing unnecessary model files...
if exist backend\models\otp.py del backend\models\otp.py

echo.
echo [3/6] Removing unnecessary service files...
if exist backend\services\email_service.py del backend\services\email_service.py
if exist backend\services\audit_service.py del backend\services\audit_service.py

echo.
echo [4/6] Removing heavy detection modules...
if exist backend\detectors\document_detector.py del backend\detectors\document_detector.py
if exist backend\detectors\advanced_detector_v3.py del backend\detectors\advanced_detector_v3.py

echo.
echo [5/6] Removing unnecessary folders...
if exist backend\forensics rmdir /S /Q backend\forensics
if exist backend\physics rmdir /S /Q backend\physics
if exist backend\analysis\advanced rmdir /S /Q backend\analysis\advanced
if exist backend\coverage_html rmdir /S /Q backend\coverage_html
if exist backend\tests rmdir /S /Q backend\tests

echo.
echo [6/6] Cleaning up test files...
if exist backend\test_*.py del backend\test_*.py
if exist backend\debug_*.py del backend\debug_*.py
if exist backend\create_*.py del backend\create_*.py
if exist backend\fix_*.py del backend\fix_*.py
if exist backend\simple_test.py del backend\simple_test.py
if exist backend\check_user.py del backend\check_user.py
if exist backend\.coverage del backend\.coverage
if exist backend\*.log del backend\*.log

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Review backend_backup folder
echo 2. Update requirements.txt
echo 3. Simplify routes/auth.py
echo 4. Test the application
echo.
pause
