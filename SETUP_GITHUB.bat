@echo off
echo ========================================
echo   DeepFake Detector - GitHub Setup
echo ========================================
echo.

echo Step 1: Initialize Git Repository
git init
echo.

echo Step 2: Add all files to staging
git add .
echo.

echo Step 3: Create initial commit
git commit -m "Initial commit: DeepFake Detector full-stack application"
echo.

echo Step 4: Set main branch
git branch -M main
echo.

echo ========================================
echo   NEXT STEPS:
echo ========================================
echo 1. Create a new repository on GitHub
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_REPO_URL
echo 4. Run: git push -u origin main
echo.
echo Example:
echo git remote add origin https://github.com/yourusername/deepfake-detector.git
echo git push -u origin main
echo.
pause