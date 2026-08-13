@echo off
chcp 65001 >nul
echo ========================================
echo   社區物資共享平台 - 後端啟動中...
echo ========================================
cd /d "%~dp0backend"
call venv\Scripts\activate
echo 後端啟動於 http://localhost:8000
echo API文件：http://localhost:8000/docs
echo 按 Ctrl+C 停止
echo ----------------------------------------
uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
