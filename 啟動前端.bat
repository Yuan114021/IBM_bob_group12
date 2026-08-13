@echo off
chcp 65001 >nul
echo ========================================
echo   社區物資共享平台 - 前端啟動中...
echo ========================================
cd /d "%~dp0frontend"

if not exist node_modules (
  echo 第一次執行，安裝套件中（約1-2分鐘）...
  npm install
)

echo 前端啟動於 http://localhost:5173
echo 按 Ctrl+C 停止
echo ----------------------------------------
npm run dev -- --open
pause
