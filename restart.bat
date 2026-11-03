@echo off
chcp 65001 >nul
title PU-Registrator 2.0 - Restart
color 0E

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                                                          ║
echo  ║       ПУ-РЕГИСТРАТОР 2.0 — ПЕРЕЗАПУСК                   ║
echo  ║                                                          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo  [1/3] Остановка контейнеров...
docker compose down
timeout /t 2 /nobreak >nul

echo  [2/3] Очистка кэша Redis...
docker compose exec redis redis-cli FLUSHDB 2>nul

echo  [3/3] Запуск контейнеров...
docker compose up -d

if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ══════════════════════════════════════════════════════════
    echo.
    echo  [OK] Сервер перезапущен!
    echo.
    echo  Откройте браузер: http://localhost:8080
    echo.
    echo  ══════════════════════════════════════════════════════════
) else (
    echo.
    echo  [ОШИБКА] Не удалось перезапустить сервер
)

echo.
pause
