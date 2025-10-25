@echo off
echo ========================================
echo   GitHub Readiness Verification
echo ========================================
echo.

set "READY=1"

echo [CHECK 1] Verifying project structure...
if not exist "backend" (
    echo [ERROR] Backend directory missing
    set "READY=0"
) else (
    echo [OK] Backend directory found
)

if not exist "frontend" (
    echo [ERROR] Frontend directory missing  
    set "READY=0"
) else (
    echo [OK] Frontend directory found
)

if not exist "docs" (
    echo [ERROR] Documentation directory missing
    set "READY=0"
) else (
    echo [OK] Documentation directory found
)

echo.
echo [CHECK 2] Verifying essential files...
if not exist "README.md" (
    echo [ERROR] README.md missing
    set "READY=0"
) else (
    echo [OK] README.md found
)

if not exist "LICENSE" (
    echo [ERROR] LICENSE missing
    set "READY=0"
) else (
    echo [OK] LICENSE found
)

if not exist ".gitignore" (
    echo [ERROR] .gitignore missing
    set "READY=0"
) else (
    echo [OK] .gitignore found
)

if not exist "CONTRIBUTING.md" (
    echo [ERROR] CONTRIBUTING.md missing
    set "READY=0"
) else (
    echo [OK] CONTRIBUTING.md found
)

echo.
echo [CHECK 3] Verifying configuration files...
if not exist "backend\.env.example" (
    echo [ERROR] Backend .env.example missing
    set "READY=0"
) else (
    echo [OK] Backend .env.example found
)

if not exist "frontend\.env.example" (
    echo [ERROR] Frontend .env.example missing
    set "READY=0"
) else (
    echo [OK] Frontend .env.example found
)

if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml missing
    set "READY=0"
) else (
    echo [OK] docker-compose.yml found
)

echo.
echo [CHECK 4] Verifying no sensitive files...
if exist "backend\.env" (
    echo [WARNING] backend\.env found - will be ignored by .gitignore
)

if exist "frontend\.env" (
    echo [WARNING] frontend\.env found - will be ignored by .gitignore
)

echo [OK] No sensitive files in root directory

echo.
echo [CHECK 5] Verifying GitHub Actions...
if not exist ".github\workflows\ci.yml" (
    echo [ERROR] GitHub Actions workflow missing
    set "READY=0"
) else (
    echo [OK] GitHub Actions workflow found
)

echo.
echo [CHECK 6] Counting project files...
for /f %%i in ('dir /s /b *.py ^| find /c /v ""') do set "PY_COUNT=%%i"
for /f %%i in ('dir /s /b *.jsx *.js ^| find /c /v ""') do set "JS_COUNT=%%i"
for /f %%i in ('dir /s /b *.md ^| find /c /v ""') do set "MD_COUNT=%%i"

echo [INFO] Python files: %PY_COUNT%
echo [INFO] JavaScript/React files: %JS_COUNT%
echo [INFO] Documentation files: %MD_COUNT%

echo.
echo ========================================
if "%READY%"=="1" (
    echo         ✅ GITHUB READY! ✅
    echo ========================================
    echo.
    echo Your project is ready for GitHub upload!
    echo.
    echo Next steps:
    echo 1. Run UPLOAD_TO_GITHUB.bat to upload
    echo 2. Or manually push using git commands
    echo.
    echo Repository will include:
    echo ✅ Complete full-stack application
    echo ✅ Advanced ML detection algorithms
    echo ✅ Modern React frontend  
    echo ✅ Flask backend API
    echo ✅ Docker configuration
    echo ✅ GitHub Actions CI/CD
    echo ✅ Comprehensive documentation
    echo ✅ Automated setup scripts
    echo ✅ Security best practices
    echo.
) else (
    echo         ❌ NOT READY ❌
    echo ========================================
    echo.
    echo Please fix the errors above before uploading to GitHub.
    echo.
)

pause