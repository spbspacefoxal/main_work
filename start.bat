@echo off
chcp 65001 >nul
title PU-Registrator 2.0 - Server
color 0B

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                                                          ║
echo  ║       ПУ-РЕГИСТРАТОР 2.0 — ЗАПУСК                       ║
echo  ║                                                          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM Проверка Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ОШИБКА] Docker не найден!
    pause
    exit /b 1
)

echo  [INFO] Запуск контейнеров...
docker compose up -d

if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ══════════════════════════════════════════════════════════
    echo.
    echo  [OK] Сервер запущен!
    echo.
    echo  Откройте браузер: http://localhost:8080
    echo.
    echo  Для просмотра логов: docker compose logs -f
    echo  Для остановки: stop.bat
    echo.
    echo  ══════════════════════════════════════════════════════════
) else (
    echo.
    echo  [ОШИБКА] Не удалось запустить сервер
    echo  Проверьте, что Docker запущен
)

echo.
pause
