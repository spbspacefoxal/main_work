@echo off
chcp 65001 >nul
title PU-Registrator v1.0 - Server
color 0B

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║                                              ║
echo  ║       ПУ-РЕГИСТРАТОР v1.0 — ЗАПУСК          ║
echo  ║                                              ║
echo  ╚══════════════════════════════════════════════╝
echo.

REM Проверка наличия Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ОШИБКА] Node.js не найден!
    echo  Установите Node.js с https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Переход в папку проекта
cd /d "%~dp0"

REM Проверка наличия database.json
if not exist database.json (
    echo  [INFO] Создание database.json...
    echo {"records":[],"version":"1.0","created":"","lastModified":""} > database.json
)

REM Проверка наличия node_modules
if not exist node_modules (
    echo  [INFO] Установка зависимостей...
    call npm install
    echo.
)

REM Проверка наличия dist
if not exist dist (
    echo  [INFO] Сборка проекта...
    call npm run build
    echo.
)

echo  ══════════════════════════════════════════════
echo.
echo  [INFO] Запуск сервера...
echo  [INFO] Откройте браузер: http://localhost:3000
echo.
echo  Для остановки сервера:
echo    - Закройте это окно
echo    - Или запустите stop.bat
echo    - Или нажмите Ctrl+C
echo.
echo  ══════════════════════════════════════════════
echo.

REM Запуск сервера
node server.js

echo.
echo  [INFO] Сервер остановлен.
echo.
pause
