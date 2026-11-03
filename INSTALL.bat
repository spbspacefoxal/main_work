@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════╗
echo ║   ПУ-РЕГИСТРАТОР - УСТАНОВЩИК ПРОЕКТА      ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Этот скрипт создаст полный проект ПУ-Регистратор
echo в текущей папке.
echo.
pause

REM Создание структуры папок
echo [1/8] Создание структуры папок...
if not exist src mkdir src
if not exist src\components mkdir src\components
if not exist dist mkdir dist

REM Создание package.json
echo [2/8] Создание package.json...
(
echo {
echo   "name": "pu-registrator",
echo   "private": true,
echo   "type": "module",
echo   "scripts": {
echo     "dev": "vite",
echo     "build": "vite build",
echo     "start": "node server.js"
echo   },
echo   "dependencies": {
echo     "cors": "^2.8.6",
echo     "express": "^5.3.0",
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0",
echo     "xlsx": "^0.18.5"
echo   },
echo   "devDependencies": {
echo     "@tailwindcss/vite": "^4.1.7",
echo     "@types/react": "^18.2.0",
echo     "@types/react-dom": "^18.2.0",
echo     "@vitejs/plugin-react": "^4.3.4",
echo     "tailwindcss": "^4.1.7",
echo     "typescript": "^5.7.0",
echo     "vite": "^6.3.5"
echo   }
echo }
) > package.json

REM Создание database.json
echo [3/8] Создание database.json...
(
echo {
echo   "records": [],
echo   "version": "1.0",
echo   "created": "",
echo   "lastModified": ""
echo }
) > database.json

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   ВАЖНО!                                    ║
echo ╠══════════════════════════════════════════════╣
echo ║                                              ║
echo ║   Для завершения установки вам нужно:        ║
echo ║                                              ║
echo ║   1. Скопировать все файлы из папки src/     ║
echo ║      из текущего проекта в новую папку       ║
echo ║                                              ║
echo ║   2. Скопировать server.js, start.bat,       ║
echo ║      start.sh, index.html, vite.config.js,   ║
echo ║      tsconfig.json                           ║
echo ║                                              ║
echo ║   3. Выполнить: npm install                  ║
echo ║                                              ║
echo ║   4. Выполнить: npm run build                ║
echo ║                                              ║
echo ║   5. Запустить: start.bat                    ║
echo ║                                              ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Все необходимые файлы находятся в текущем проекте.
echo Скопируйте их в новую папку для развертывания.
echo.
pause
