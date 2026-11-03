@echo off
chcp 65001 >nul
title PU-Registrator v1.0 - Stop Server
color 0C

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║                                              ║
echo  ║       ПУ-РЕГИСТРАТОР v1.0 — ОСТАНОВКА        ║
echo  ║                                              ║
echo  ╚══════════════════════════════════════════════╝
echo.

REM Поиск процесса node
echo  [INFO] Поиск процесса сервера...
echo.

tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I "node.exe" >NUL
if %ERRORLEVEL% EQU 0 (
    echo  [INFO] Найден процесс Node.js
    echo  [INFO] Остановка сервера...
    echo.
    
    REM Завершение всех процессов node
    taskkill /F /IM node.exe >NUL 2>&1
    
    if %ERRORLEVEL% EQU 0 (
        echo  ══════════════════════════════════════════════
        echo.
        echo  [OK] Сервер успешно остановлен!
        echo.
        echo  ══════════════════════════════════════════════
    ) else (
        echo  ══════════════════════════════════════════════
        echo.
        echo  [ОШИБКА] Не удалось остановить сервер.
        echo  Попробуйте закрыть окно сервера вручную.
        echo.
        echo  ══════════════════════════════════════════════
    )
) else (
    echo  ══════════════════════════════════════════════
    echo.
    echo  [INFO] Сервер не запущен.
    echo.
    echo  ══════════════════════════════════════════════
)

echo.
pause
