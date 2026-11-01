@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════╗
echo ║     ПУ-РЕГИСТРАТОР v1.0 — ЗАПУСК...        ║
echo ╚══════════════════════════════════════════════╝
echo.

REM Проверка наличия Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Node.js не найден!
    echo Пожалуйста, установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

REM Проверка наличия database.json
if not exist database.json (
    echo { "records": [], "version": "1.0", "created": "", "lastModified": "" } > database.json
    echo [INFO] Создан файл database.json
)

REM Проверка наличия node_modules
if not exist node_modules (
    echo [INFO] Установка зависимостей...
    call npm install
)

REM Проверка наличия dist
if not exist dist (
    echo [INFO] Сборка проекта...
    call npm run build
)

echo.
echo [INFO] Запуск сервера...
echo [INFO] Откройте браузер: http://localhost:3000
echo.

REM Запуск сервера
node server.js

pause
