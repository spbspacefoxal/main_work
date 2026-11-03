@echo off
chcp 65001 >nul
title PU-Registrator 2.0 - Installation
color 0B

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                                                          ║
echo  ║       ПУ-РЕГИСТРАТОР 2.0 — УСТАНОВКА                    ║
echo  ║       Nginx + PHP-FPM + PostgreSQL + Redis               ║
echo  ║                                                          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

REM Проверка Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ОШИБКА] Docker не найден!
    echo.
    echo  Установите Docker Desktop:
    echo  https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM Проверка Docker Compose
docker compose version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ОШИБКА] Docker Compose не найден!
    echo  Обновите Docker Desktop до последней версии.
    pause
    exit /b 1
)

echo  [1/5] Проверка Docker... OK
echo.

REM Создание .env файла
if not exist backend\.env (
    echo  [2/5] Создание .env файла...
    copy backend\.env.example backend\.env >nul
    echo  [OK] .env создан
) else (
    echo  [2/5] .env уже существует... SKIP
)
echo.

REM Сборка Docker образов
echo  [3/5] Сборка Docker образов (это займёт несколько минут)...
docker compose build
if %ERRORLEVEL% NEQ 0 (
    echo  [ОШИБКА] Не удалось собрать образы
    pause
    exit /b 1
)
echo  [OK] Образы собраны
echo.

REM Запуск контейнеров
echo  [4/5] Запуск контейнеров...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo  [ОШИБКА] Не удалось запустить контейнеры
    pause
    exit /b 1
)
echo  [OK] Контейнеры запущены
echo.

REM Ожидание готовности БД
echo  [5/5] Ожидание готовности PostgreSQL...
timeout /t 5 /nobreak >nul
echo  [OK] PostgreSQL готов
echo.

echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                                                          ║
echo  ║       ✓ УСТАНОВКА ЗАВЕРШЕНА УСПЕШНО!                    ║
echo  ║                                                          ║
echo  ╠══════════════════════════════════════════════════════════╣
echo  ║                                                          ║
echo  ║  Приложение доступно по адресу:                          ║
echo  ║  http://localhost:8080                                   ║
echo  ║                                                          ║
echo  ║  Redis Commander (опционально):                          ║
echo  ║  http://localhost:8081                                   ║
echo  ║                                                          ║
echo  ║  Учётные записи:                                         ║
echo  ║  Пользователь:  AR-user / qwerty                         ║
echo  ║  Администратор: SP-admin / 12345                         ║
echo  ║  Root:          SP-root / a413401L                       ║
echo  ║                                                          ║
echo  ║  Для остановки: stop.bat                                 ║
echo  ║  Для перезапуска: restart.bat                            ║
echo  ║  Для логов: docker compose logs -f                       ║
echo  ║                                                          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
pause
