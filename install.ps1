# ============================================================================
# ПУ-РЕГИСТРАТОР v1.0 - АВТОУСТАНОВЩИК
# ============================================================================
# ИНСТРУКЦИЯ:
# 1. Скопируйте ВЕСЬ текст этого файла
# 2. Откройте Блокнот (Notepad) на вашем компьютере
# 3. Вставьте скопированный текст
# 4. Сохраните файл как "install.ps1" (ВАЖНО: тип файла - "Все файлы")
# 5. Откройте PowerShell от имени администратора
# 6. Перейдите в папку, где хотите создать проект:
#    cd C:\Projects
# 7. Выполните команду:
#    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#    .\install.ps1
# 8. Готово! Проект будет создан автоматически
# ============================================================================

$projectName = "PU-Registrator"
$projectDir = Join-Path (Get-Location) $projectName

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ПУ-РЕГИСТРАТОР v1.0 - УСТАНОВЩИК" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Создание папки проекта
if (Test-Path $projectDir) {
    Write-Host "[!] Папка $projectName уже существует. Удаляю..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $projectDir
}

Write-Host "[1/10] Создание структуры папок..." -ForegroundColor Green
New-Item -ItemType Directory -Path $projectDir -Force | Out-Null
New-Item -ItemType Directory -Path "$projectDir\src\components" -Force | Out-Null

# ============================================================================
# package.json
# ============================================================================
Write-Host "[2/10] Создание package.json..." -ForegroundColor Green
@'
{
  "name": "pu-registrator",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.6",
    "express": "^5.3.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.7",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.7",
    "typescript": "^5.7.0",
    "vite": "^6.3.5"
  }
}
'@ | Out-File -FilePath "$projectDir\package.json" -Encoding UTF8

# ============================================================================
# database.json
# ============================================================================
Write-Host "[3/10] Создание database.json..." -ForegroundColor Green
@'
{
  "records": [],
  "version": "1.0",
  "created": "",
  "lastModified": ""
}
'@ | Out-File -FilePath "$projectDir\database.json" -Encoding UTF8

# ============================================================================
# index.html
# ============================================================================
Write-Host "[4/10] Создание index.html..." -ForegroundColor Green
@'
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ПУ-Регистратор v1.0</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@ | Out-File -FilePath "$projectDir\index.html" -Encoding UTF8

# ============================================================================
# vite.config.js
# ============================================================================
Write-Host "[5/10] Создание vite.config.js..." -ForegroundColor Green
@'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
});
'@ | Out-File -FilePath "$projectDir\vite.config.js" -Encoding UTF8

# ============================================================================
# tsconfig.json
# ============================================================================
Write-Host "[6/10] Создание tsconfig.json..." -ForegroundColor Green
@'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "noEmit": true,
    "allowImportingTsExtensions": true
  },
  "include": ["src"]
}
'@ | Out-File -FilePath "$projectDir\tsconfig.json" -Encoding UTF8

# ============================================================================
# server.js
# ============================================================================
Write-Host "[7/10] Создание server.js..." -ForegroundColor Green
@'
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { records: [], version: '1.0', created: new Date().toISOString(), lastModified: '' };
  }
}

function writeDB(db) {
  db.lastModified = new Date().toISOString();
  if (!db.created) db.created = new Date().toISOString();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

app.get('/api/records', (req, res) => {
  const db = readDB();
  res.json(db.records);
});

app.post('/api/records', (req, res) => {
  const db = readDB();
  const record = req.body;
  db.records.push(record);
  writeDB(db);
  res.json({ success: true, id: record.id });
});

app.put('/api/records/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const idx = db.records.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Запись не найдена' });
  db.records[idx] = { ...db.records[idx], ...req.body };
  writeDB(db);
  res.json({ success: true });
});

app.delete('/api/records/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  db.records = db.records.filter(r => r.id !== id);
  writeDB(db);
  res.json({ success: true });
});

app.get('/api/check', (req, res) => {
  const db = readDB();
  const { meterNumber, modemType, simCardNumber, excludeId } = req.query;
  const result = { meterNumberExists: false, modemExists: false, simCardExists: false };
  if (meterNumber) result.meterNumberExists = db.records.some(r => r.meterNumber === meterNumber && r.id !== excludeId);
  if (modemType && modemType !== 'встроенный') result.modemExists = db.records.some(r => r.modemType === modemType && r.id !== excludeId);
  if (simCardNumber) result.simCardExists = db.records.some(r => r.simCardNumber === simCardNumber && r.id !== excludeId);
  res.json(result);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║       ПУ-РЕГИСТРАТОР v1.0 — СЕРВЕР          ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  Сервер запущен: http://localhost:' + PORT + '     ║');
  console.log('║  База данных: database.json                  ║');
  console.log('║  Для остановки: Ctrl+C                       ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
});
'@ | Out-File -FilePath "$projectDir\server.js" -Encoding UTF8

# ============================================================================
# start.bat
# ============================================================================
Write-Host "[8/10] Создание start.bat..." -ForegroundColor Green
@'
@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════╗
echo ║     ПУ-РЕГИСТРАТОР v1.0 — ЗАПУСК...        ║
echo ╚══════════════════════════════════════════════╝
echo.

if not exist database.json (
    echo { "records": [], "version": "1.0", "created": "", "lastModified": "" } > database.json
)

if not exist node_modules (
    echo [INFO] Установка зависимостей...
    call npm install
)

if not exist dist (
    echo [INFO] Сборка проекта...
    call npm run build
)

echo.
echo [INFO] Запуск сервера...
echo [INFO] Откройте браузер: http://localhost:3000
echo.

node server.js
pause
'@ | Out-File -FilePath "$projectDir\start.bat" -Encoding UTF8

# ============================================================================
# Установка зависимостей
# ============================================================================
Write-Host "[9/10] Установка зависимостей (это займёт время)..." -ForegroundColor Green
Set-Location $projectDir
npm install

# ============================================================================
# Сборка проекта
# ============================================================================
Write-Host "[10/10] Сборка проекта..." -ForegroundColor Green
npm run build

# ============================================================================
# Готово!
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ ПРОЕКТ УСПЕШНО УСТАНОВЛЕН!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Папка проекта: $projectDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Для запуска выполните:" -ForegroundColor Yellow
Write-Host "  cd $projectDir" -ForegroundColor White
Write-Host "  .\start.bat" -ForegroundColor White
Write-Host ""
Write-Host "Или вручную:" -ForegroundColor Yellow
Write-Host "  node server.js" -ForegroundColor White
Write-Host ""
Write-Host "Затем откройте браузер: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Учётные записи:" -ForegroundColor Yellow
Write-Host "  Пользователь: AR-user / qwerty" -ForegroundColor White
Write-Host "  Администратор: SP-admin / 12345" -ForegroundColor White
Write-Host "  Root: SP-root / a413401L" -ForegroundColor White
Write-Host ""
