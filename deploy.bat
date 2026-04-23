@echo off
echo ========================================
echo   SHADOWLARK ORACLE - VANILLA DEPLOY
echo ========================================
echo.
echo Initializing Git (if needed)...
if not exist .git (
    git init
    git remote add origin https://github.com/codefoxsoft/shadowlarkoraclewebsite
)

echo.
echo Configuring Identity...
git config user.email "psychowolf94@gmail.com"
git config user.name "codefoxsoft"

echo.
echo Staging changes...
:: Remove large setup file from git tracking if present
echo ShadowlarkOracle_Setup.exe > .gitignore
git add .

echo.
echo Committing updates...
git commit -m "Site update: %date% %time% - Finalizing fitted carousel proportions and cache-busting."

echo.
echo Pushing to GitHub Pages...
git branch -M main
git push -f origin main

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
pause
