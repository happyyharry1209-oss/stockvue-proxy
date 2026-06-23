@echo off
title StockVue Pro - 全球股票監控
cd /d "%~dp0"

echo.
echo ═══════════════════════════════════════════
echo   StockVue Pro - 全球股票監控平台
echo ═══════════════════════════════════════════
echo.
echo [1/2] 啟動資料代理伺服器...

start "StockVue-Proxy" /MIN cmd /c "node server.js"

echo [2/2] 開啟監控網頁...

timeout /t 2 /nobreak >nul
start "" "index.html"

echo.
echo ✅ 已啟動！請查看瀏覽器。
echo    關閉此視窗即可停止服務。
echo.
pause
