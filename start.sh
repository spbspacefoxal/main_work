#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     ПУ-РЕГИСТРАТОР v1.0 — ЗАПУСК...        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "[ОШИБКА] Node.js не найден!"
    echo "Пожалуйста, установите Node.js с https://nodejs.org/"
    exit 1
fi

# Проверка наличия database.json
if [ ! -f database.json ]; then
    echo '{ "records": [], "version": "1.0", "created": "", "lastModified": "" }' > database.json
    echo "[INFO] Создан файл database.json"
fi

# Проверка наличия node_modules
if [ ! -d node_modules ]; then
    echo "[INFO] Установка зависимостей..."
    npm install
fi

# Проверка наличия dist
if [ ! -d dist ]; then
    echo "[INFO] Сборка проекта..."
    npm run build
fi

echo ""
echo "[INFO] Запуск сервера..."
echo "[INFO] Откройте браузер: http://localhost:3000"
echo ""

# Запуск сервера
node server.js
