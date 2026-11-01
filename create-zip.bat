@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════╗
echo ║   Создание ZIP архива проекта...            ║
echo ╚══════════════════════════════════════════════╝
echo.

REM Удаляем старый архив если есть
if exist "ПУ-Регистратор.zip" (
    echo [INFO] Удаление старого архива...
    del "ПУ-Регистратор.zip"
)

REM Создаем временную папку для архива
if exist "ПУ-Регистратор_temp" (
    rmdir /s /q "ПУ-Регистратор_temp"
)
mkdir "ПУ-Регистратор_temp"

echo [INFO] Копирование файлов...

REM Копируем основные файлы
copy database.json "ПУ-Регистратор_temp\" >nul
copy server.js "ПУ-Регистратор_temp\" >nul
copy start.bat "ПУ-Регистратор_temp\" >nul
copy start.sh "ПУ-Регистратор_temp\" >nul
copy package.json "ПУ-Регистратор_temp\" >nul
copy package-lock.json "ПУ-Регистратор_temp\" >nul
copy README.md "ПУ-Регистратор_temp\" >nul

REM Копируем папки
xcopy /s /e /q src "ПУ-Регистратор_temp\src\" >nul
xcopy /s /e /q dist "ПУ-Регистратор_temp\dist\" >nul

echo [INFO] Создание ZIP архива...

REM Создаем ZIP архив
powershell Compress-Archive -Path "ПУ-Регистратор_temp\*" -DestinationPath "ПУ-Регистратор.zip" -Force

REM Удаляем временную папку
rmdir /s /q "ПУ-Регистратор_temp"

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   ✓ Архив создан успешно!                   ║
echo ║                                              ║
echo ║   Файл: ПУ-Регистратор.zip                  ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Нажмите любую клавишу для выхода...
pause >nul
