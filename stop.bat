@echo off
chcp 65001 >nul
title PU-Registrator 2.0 - Stop
color 0C

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                                                          ║
echo  ║       ПУ-РЕГИСТРАТОР 2.0 — ОСТАНОВКА                    ║
echo  ║                                                          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo  [INFO] Остановка контейнеров...
docker compose down

if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ══════════════════════════════════════════════════════════
    echo.
    echo  [OK] Сервер остановлен!
    echo.
    echo  Данные сохранены в Docker volumes.
    echo  Для удаления данных: docker compose down -v
    echo.
    echo  ══════════════════════════════════════════════════════════
) else (
    echo.
    echo  [ОШИБКА] Не удалось остановить сервер
)

echo.
pause
