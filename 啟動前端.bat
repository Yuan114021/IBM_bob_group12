@echo off
echo ========================================
echo   Frontend Starting...
echo ========================================
cd /d "%~dp0frontend"

if not exist node_modules (
  echo Installing packages, please wait...
  npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed
    pause
    exit /b
  )
)

echo Frontend: http://localhost:5173
echo Press Ctrl+C to stop
echo ----------------------------------------
npm run dev -- --open
echo.
echo [Frontend stopped]
pause
