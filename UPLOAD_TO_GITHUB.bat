@echo off
echo ========================================
echo    DeepFake Detector - GitHub Upload
echo ========================================
echo.

:: Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Check if we're in the right directory
if not exist "backend" (
    echo [ERROR] Please run this script from the DeepFakeDetector-webside-main directory
    pause
    exit /b 1
)

echo [INFO] Preparing project for GitHub upload...
echo.

:: Initialize git repository if not already done
if not exist ".git" (
    echo [STEP 1] Initializing Git repository...
    git init
    echo.
) else (
    echo [STEP 1] Git repository already initialized
    echo.
)

:: Add all files
echo [STEP 2] Adding all files to Git...
git add .
echo.

:: Check if there are changes to commit
git diff --cached --quiet
if errorlevel 1 (
    echo [STEP 3] Committing changes...
    git commit -m "Complete DeepFake Detector application - Full stack with advanced ML detection"
    echo.
) else (
    echo [STEP 3] No changes to commit
    echo.
)

:: Set main branch
echo [STEP 4] Setting main branch...
git branch -M main
echo.

:: Add remote origin
echo [STEP 5] Adding GitHub remote...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/visheshpanchal27/DeepFakeDetector-webside.git
echo.

:: Push to GitHub
echo [STEP 6] Pushing to GitHub...
echo [INFO] You may be prompted for GitHub credentials
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to push to GitHub
    echo.
    echo Possible solutions:
    echo 1. Check your internet connection
    echo 2. Verify the repository URL is correct
    echo 3. Ensure you have push permissions to the repository
    echo 4. Try authenticating with GitHub CLI: gh auth login
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo         UPLOAD SUCCESSFUL! 🚀
echo ========================================
echo.
echo Your DeepFake Detector project has been uploaded to:
echo https://github.com/visheshpanchal27/DeepFakeDetector-webside
echo.
echo Next steps:
echo 1. Visit the repository on GitHub
echo 2. Add a description and topics
echo 3. Enable GitHub Pages if needed
echo 4. Set up CI/CD workflows
echo 5. Add collaborators if needed
echo.
echo Repository includes:
echo ✅ Complete full-stack application
echo ✅ Advanced ML detection algorithms  
echo ✅ Modern React frontend
echo ✅ Flask backend API
echo ✅ Docker configuration
echo ✅ Comprehensive documentation
echo ✅ Automated setup scripts
echo.
pause