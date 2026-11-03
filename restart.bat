@echo off
chcp 65001 >nul
title PU-Registrator v1.0 - Restart
color 0E

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║                                              ║
echo  ║       ПУ-РЕГИСТРАТОР v1.0 — ПЕРЕЗАПУСК       ║
echo  ║                                              ║
echo  ╚══════════════════════════════════════════════╝
echo.

REM Остановка сервера
echo  [1/2] Остановка сервера...
taskkill /F /IM node.exe >NUL 2>&1
timeout /t 2 /nobreak >NUL
echo  [OK] Сервер остановлен.
echo.

REM Запуск сервера
echo  [2/2] Запуск сервера...
echo.
echo  ══════════════════════════════════════════════
echo.
echo  [INFO] Сервер перезапущен!
echo  [INFO] Откройте браузер: http://localhost:3000
echo.
echo  ══════════════════════════════════════════════
echo.

start "" "%~dp0start.bat"

timeout /t 3 /nobreak >NUL
exit
