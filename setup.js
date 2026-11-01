// ============================================================================
// ПУ-РЕГИСТРАТОР v1.0 — ПОЛНЫЙ УСТАНОВЩИК (ВСЕ ФАЙЛЫ)
// ============================================================================
// ИНСТРУКЦИЯ:
// 1. Скопируйте ВЕСЬ текст этого файла
// 2. Создайте на компьютере файл setup.js
// 3. Вставьте текст и сохраните
// 4. В CMD выполните: node setup.js
// ============================================================================

const fs = require('fs');
const path = require('path');

console.log('');
console.log('========================================');
console.log('  PU-Registrator v1.0 - FULL INSTALLER');
console.log('========================================');
console.log('');

fs.mkdirSync('src', { recursive: true });
fs.mkdirSync('src/components', { recursive: true });

const files = {};

files['package.json'] = `{
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
}`;

files['index.html'] = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PU-Registrator v1.0</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

files['vite.config.js'] = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
});`;

files['tsconfig.json'] = `{
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
}`;

files['database.json'] = `{
  "records": [],
  "version": "1.0",
  "created": "",
  "lastModified": ""
}`;

files['server.js'] = `const express = require('express');
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
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
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
  console.log('========================================');
  console.log('  PU-Registrator v1.0 - Server started');
  console.log('  Open: http://localhost:' + PORT);
  console.log('========================================');
  console.log('');
});`;

files['start.bat'] = `@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   PU-Registrator v1.0 - Starting...
echo ========================================
echo.

if not exist database.json (
    echo { "records": [], "version": "1.0", "created": "", "lastModified": "" } > database.json
)

if not exist node_modules (
    echo [INFO] Installing dependencies...
    call npm install
)

if not exist dist (
    echo [INFO] Building project...
    call npm run build
)

echo.
echo [INFO] Starting server...
echo [INFO] Open browser: http://localhost:3000
echo.

node server.js
pause`;

files['src/main.tsx'] = `import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);`;

files['src/index.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }

html, body {
  margin: 0; padding: 0;
  width: 100%; height: 100%;
  overflow: hidden;
}

#root {
  width: 100%; height: 100%;
  overflow: hidden;
}

body {
  font-family: 'VT323', monospace;
  background: #00AAAA;
  color: #FFFFFF;
}

::-webkit-scrollbar { width: 16px; height: 16px; }
::-webkit-scrollbar-track { background: #0000AA; border: 1px solid #555555; }
::-webkit-scrollbar-thumb { background: #AAAAAA; border: 2px solid #555555; }
::-webkit-scrollbar-thumb:hover { background: #FFFF55; }

::selection { background: #FFFF55; color: #000000; }

input:focus, select:focus, textarea:focus {
  outline: 2px solid #FFFF55;
  outline-offset: -2px;
}

button:hover { opacity: 0.9; }
table { border-spacing: 0; }`;

// Запись всех файлов
let count = 0;
const total = Object.keys(files).length;

for (const [filePath, content] of Object.entries(files)) {
  const dir = path.dirname(filePath);
  if (dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  count++;
  console.log('[' + count + '/' + total + '] ' + filePath);
}

console.log('');
console.log('========================================');
console.log('  Базовые файлы созданы! (' + count + ' файлов)');
console.log('========================================');
console.log('');
console.log('Теперь скопируйте и запустите setup-components.js');
console.log('');
