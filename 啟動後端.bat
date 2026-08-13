@echo off
echo ========================================
echo   Backend Starting...
echo ========================================
cd /d "%~dp0backend"

if not exist venv\Scripts\activate.bat (
  echo [ERROR] venv not found. Please run: python -m venv venv
  pause
  exit /b
)

call venv\Scripts\activate.bat
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Press Ctrl+C to stop
echo ----------------------------------------
uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo.
echo [Backend stopped]
pause
