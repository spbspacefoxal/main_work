// ============================================================================
// ПУ-РЕГИСТРАТОР v1.0 — АВТОУСТАНОВЩИК
// ============================================================================
// ИНСТРУКЦИЯ:
// 1. Скопируйте ВЕСЬ текст этого файла
// 2. Создайте на своём компьютере файл setup.js
// 3. Вставьте текст и сохраните
// 4. В CMD выполните: node setup.js
// 5. Готово! Все файлы проекта будут созданы автоматически
// ============================================================================

const fs = require('fs');
const path = require('path');

console.log('');
console.log('========================================');
console.log('  ПУ-РЕГИСТРАТОР v1.0 — УСТАНОВЩИК');
console.log('========================================');
console.log('');

// Создание папок
console.log('[1/10] Создание структуры папок...');
fs.mkdirSync('src', { recursive: true });
fs.mkdirSync('src/components', { recursive: true });

// ============================================================================
const files = {};

// ============================================================================
// package.json
// ============================================================================
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

// ============================================================================
// index.html
// ============================================================================
files['index.html'] = `<!doctype html>
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
</html>`;

// ============================================================================
// vite.config.js
// ============================================================================
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

// ============================================================================
// tsconfig.json
// ============================================================================
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

// ============================================================================
// database.json
// ============================================================================
files['database.json'] = `{
  "records": [],
  "version": "1.0",
  "created": "",
  "lastModified": ""
}`;

// ============================================================================
// server.js
// ============================================================================
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
  if (modemType && modemType !== '\\u0432\\u0441\\u0442\\u0440\\u043e\\u0435\\u043d\\u043d\\u044b\\u0439') result.modemExists = db.records.some(r => r.modemType === modemType && r.id !== excludeId);
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

// ============================================================================
// start.bat
// ============================================================================
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

// ============================================================================
// src/main.tsx
// ============================================================================
files['src/main.tsx'] = `import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);`;

// ============================================================================
// src/index.css
// ============================================================================
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

// ============================================================================
// src/types.ts
// ============================================================================
files['src/types.ts'] = `export type RegionCode = 'AR' | 'MU' | 'PZ' | 'PS' | 'KN' | 'VN' | 'SC' | 'SP' | 'LE' | 'VG';
export const ALL_REGIONS: RegionCode[] = ['AR', 'MU', 'PZ', 'PS', 'KN', 'VN', 'SC', 'SP', 'LE', 'VG'];
export type ActionType = '\\u0420\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0430\\u0446\\u0438\\u044f' | '\\u0420\\u0435\\u0434\\u0430\\u043a\\u0442\\u0438\\u0440\\u043e\\u0432\\u0430\\u043d\\u0438\\u0435' | '\\u0423\\u0434\\u0430\\u043b\\u0435\\u043d\\u0438\\u0435';
export type MeterType = '\\u041c\\u0435\\u0440\\u043a\\u0443\\u0440\\u0438\\u0439 234 G7' | '\\u0420\\u043e\\u0442\\u0435\\u043a \\u0420\\u0422\\u041c-03' | '\\u0420\\u043e\\u0442\\u0435\\u043a \\u0420\\u0422\\u041c-01' | '\\u041d\\u0435\\u0432\\u0430 314' | '\\u041d\\u0435\\u0432\\u0430 412' | '\\u042d\\u043d\\u0435\\u0440\\u0433\\u043e\\u043c\\u0435\\u0440\\u0430 CE-303';
export const METER_TYPES: MeterType[] = ['\\u041c\\u0435\\u0440\\u043a\\u0443\\u0440\\u0438\\u0439 234 G7', '\\u0420\\u043e\\u0442\\u0435\\u043a \\u0420\\u0422\\u041c-03', '\\u0420\\u043e\\u0442\\u0435\\u043a \\u0420\\u0422\\u041c-01', '\\u041d\\u0435\\u0432\\u0430 314', '\\u041d\\u0435\\u0432\\u0430 412', '\\u042d\\u043d\\u0435\\u0440\\u0433\\u043e\\u043c\\u0435\\u0440\\u0430 CE-303'];
export type RegistrationStatus = '' | 'Ok' | 'Error';

export interface MeterRecord {
  id: string;
  regionCode: RegionCode;
  bsNumber: string;
  actionType: ActionType;
  meterType: MeterType;
  meterNumber: string;
  modemType: string;
  simCardNumber: string;
  note: string;
  registrationDate: string;
  address: string;
  comment: string;
  registeredBy: string;
  registrationStatus: RegistrationStatus;
  statusDate: string;
  statusAdmin: string;
}

export interface User {
  login: string;
  password: string;
  regions: RegionCode[];
  role: 'user' | 'admin' | 'root';
  canEdit: boolean;
  canDelete: boolean;
  canSetStatus: boolean;
  canExport: boolean;
}

export const USERS: User[] = [
  { login: 'AR-user', password: 'qwerty', regions: ['AR'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false, canExport: false },
  { login: 'MU-user', password: 'qwerty', regions: ['MU'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false, canExport: false },
  { login: 'PZ-user', password: 'qwerty', regions: ['PZ'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false, canExport: false },
  { login: 'PS-user', password: 'qwerty', regions: ['PS'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false, canExport: false },
  { login: 'KN-user', password: 'qwerty', regions: ['KN'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false, canExport: false },
  { login: 'VG-user', password: 'qwerty', regions: ['VG'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false, canExport: false },
  { login: 'VN-user', password: 'qwerty', regions: ['VN'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false, canExport: false },
  { login: 'SP-East', password: 'qwerty', regions: ['SP', 'LE', 'SC'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false, canExport: false },
  { login: 'SP-Nord', password: 'qwerty', regions: ['SP', 'LE', 'SC'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false, canExport: false },
  { login: 'SP-West', password: 'qwerty', regions: ['SP', 'LE', 'SC'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false, canExport: false },
  { login: 'SP-South', password: 'qwerty', regions: ['SP', 'LE', 'SC'], role: 'user', canEdit: false, canDelete: false, canSetStatus: false, canExport: false },
  { login: 'SP-admin', password: '12345', regions: ALL_REGIONS, role: 'admin', canEdit: true, canDelete: true, canSetStatus: true, canExport: true },
  { login: 'SP-root', password: 'a413401L', regions: ALL_REGIONS, role: 'root', canEdit: true, canDelete: true, canSetStatus: true, canExport: true },
];

export type Page = 'view' | 'registration' | 'database' | 'feedback' | 'help' | 'about';`;

// ============================================================================
// src/db.ts
// ============================================================================
files['src/db.ts'] = `import { MeterRecord } from './types';

const API_BASE = '/api';
let recordsCache: MeterRecord[] | null = null;

export async function getRecords(): Promise<MeterRecord[]> {
  try {
    const response = await fetch(API_BASE + '/records');
    const data = await response.json();
    recordsCache = data;
    return data;
  } catch (e) {
    return recordsCache || [];
  }
}

export async function addRecord(record: MeterRecord): Promise<void> {
  await fetch(API_BASE + '/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  recordsCache = null;
}

export async function updateRecord(id: string, updates: Partial<MeterRecord>): Promise<void> {
  await fetch(API_BASE + '/records/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  recordsCache = null;
}

export async function deleteRecord(id: string): Promise<void> {
  await fetch(API_BASE + '/records/' + id, { method: 'DELETE' });
  recordsCache = null;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export async function checkDuplicates(
  meterNumber?: string,
  modemType?: string,
  simCardNumber?: string,
  excludeId?: string
): Promise<{ meterNumberExists: boolean; modemExists: boolean; simCardExists: boolean }> {
  try {
    const params = new URLSearchParams();
    if (meterNumber) params.set('meterNumber', meterNumber);
    if (modemType) params.set('modemType', modemType);
    if (simCardNumber) params.set('simCardNumber', simCardNumber);
    if (excludeId) params.set('excludeId', excludeId);
    const response = await fetch(API_BASE + '/check?' + params.toString());
    return await response.json();
  } catch (e) {
    return { meterNumberExists: false, modemExists: false, simCardExists: false };
  }
}`;

// ============================================================================
// src/export.ts
// ============================================================================
files['src/export.ts'] = `import * as XLSX from 'xlsx';
import { getRecords } from './db';

export async function exportToXlsx(): Promise<void> {
  const records = await getRecords();
  const data = records.map((r, idx) => ({
    '\\u2116': idx + 1,
    '\\u041a\\u043e\\u0434 \\u0440\\u0435\\u0433\\u0438\\u043e\\u043d\\u0430': r.regionCode,
    '\\u041d\\u043e\\u043c\\u0435\\u0440 \\u0411\\u0421': r.bsNumber,
    '\\u0422\\u0438\\u043f \\u0434\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u044f': r.actionType,
    '\\u0422\\u0438\\u043f \\u043f\\u0440\\u0438\\u0431\\u043e\\u0440\\u0430 \\u0443\\u0447\\u0451\\u0442\\u0430': r.meterType,
    '\\u041d\\u043e\\u043c\\u0435\\u0440 \\u0441\\u0447\\u0451\\u0442\\u0447\\u0438\\u043a\\u0430': r.meterNumber,
    '\\u0422\\u0438\\u043f \\u043c\\u043e\\u0434\\u0435\\u043c\\u0430': r.modemType,
    '\\u041d\\u043e\\u043c\\u0435\\u0440 SIM-\\u043a\\u0430\\u0440\\u0442\\u044b': r.simCardNumber,
    '\\u041e\\u0442\\u043c\\u0435\\u0442\\u043a\\u0430': r.note,
    '\\u0417\\u0430\\u0440\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0438\\u0440\\u043e\\u0432\\u0430\\u043b': r.registeredBy,
    '\\u0414\\u0430\\u0442\\u0430 \\u0440\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0430\\u0446\\u0438\\u0438': r.registrationDate,
    '\\u0410\\u0434\\u0440\\u0435\\u0441 \\u043e\\u0431\\u044a\\u0435\\u043a\\u0442\\u0430': r.address,
    '\\u041f\\u0440\\u0438\\u043c\\u0435\\u0447\\u0430\\u043d\\u0438\\u0435': r.comment,
    '\\u0421\\u0442\\u0430\\u0442\\u0443\\u0441': r.registrationStatus || '\\u2014',
    '\\u0414\\u0430\\u0442\\u0430 \\u043e\\u0434\\u043e\\u0431\\u0440\\u0435\\u043d\\u0438\\u044f': r.statusDate || '',
    '\\u041e\\u0434\\u043e\\u0431\\u0440\\u0438\\u043b': r.statusAdmin || '',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 5 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 20 },
    { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 15 }, { wch: 15 },
    { wch: 20 }, { wch: 40 }, { wch: 30 }, { wch: 10 }, { wch: 20 }, { wch: 15 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '\\u041f\\u0440\\u0438\\u0431\\u043e\\u0440\\u044b \\u0443\\u0447\\u0451\\u0442\\u0430');
  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU').replace(/\\./g, '');
  XLSX.writeFile(wb, '\\u0420\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0430\\u0442\\u043e\\u0440' + dateStr + '.xlsx');
}`;

// ============================================================================
// src/App.tsx
// ============================================================================
files['src/App.tsx'] = `import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Page } from './types';
import Login from './components/Login';
import Layout from './components/Layout';
import ViewMeters from './components/ViewMeters';
import Registration from './components/Registration';
import Database from './components/Database';
import Feedback from './components/Feedback';
import Help from './components/Help';
import About from './components/About';

const SESSION_TIMEOUT = 10 * 60 * 1000;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('view');
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (sessionTimerRef.current) { clearTimeout(sessionTimerRef.current); sessionTimerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    sessionTimerRef.current = setTimeout(() => { setUser(null); setCurrentPage('view'); }, SESSION_TIMEOUT);
  }, [clearTimer]);

  const resetTimer = useCallback(() => { startTimer(); }, [startTimer]);

  useEffect(() => {
    if (!user) { clearTimer(); return; }
    const handleActivity = () => { resetTimer(); };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    startTimer();
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearTimer();
    };
  }, [user, startTimer, resetTimer, clearTimer]);

  const handleLogin = (loggedUser: User) => { setUser(loggedUser); setCurrentPage('view'); };
  const handleLogout = () => { setUser(null); setCurrentPage('view'); clearTimer(); };
  const handleNavigate = (page: Page) => { setCurrentPage(page); resetTimer(); };

  if (!user) { return <Login onLogin={handleLogin} />; }

  const renderPage = () => {
    switch (currentPage) {
      case 'view': return <ViewMeters user={user} />;
      case 'registration': return <Registration user={user} />;
      case 'database': return <Database user={user} />;
      case 'feedback': return <Feedback />;
      case 'help': return <Help />;
      case 'about': return <About />;
      default: return <ViewMeters user={user} />;
    }
  };

  return (
    <Layout user={user} currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}`;

// ============================================================================
// src/components/Login.tsx
// ============================================================================
files['src/components/Login.tsx'] = `import React, { useState, useEffect, useRef } from 'react';
import { User, USERS } from '../types';

interface LoginProps { onLogin: (user: User) => void; }

export default function Login({ onLogin }: LoginProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const loginRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { loginRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.login === login && u.password === password);
    if (user) { setError(''); onLogin(user); }
    else { setError('\\u258c \\u041e\\u0428\\u0418\\u0411\\u041a\\u0410: \\u041d\\u0435\\u0432\\u0435\\u0440\\u043d\\u044b\\u0439 \\u043b\\u043e\\u0433\\u0438\\u043d \\u0438\\u043b\\u0438 \\u043f\\u0430\\u0440\\u043e\\u043b\\u044c!'); }
  };

  const inputStyle = { background: '#000000', color: '#FFFFFF', borderColor: '#AAAAAA', fontFamily: 'VT323, monospace', fontSize: '20px' };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0000AA' }}>
      <div className="border-2 border-white p-0" style={{ background: '#0000AA', minWidth: '500px', boxShadow: '4px 4px 0px #000' }}>
        <div className="text-center py-1" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#000' }}>
            \\u2554{'\\u2550'.repeat(38)}\\u2557
          </span>
        </div>
        <div className="text-center" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#000' }}>
            \\u2551&nbsp;&nbsp;&nbsp;\\u041f\\u0423-\\u0420\\u0415\\u0413\\u0418\\u0421\\u0422\\u0420\\u0410\\u0422\\u041e\\u0420 v1.0 \\u2014 \\u0410\\u0412\\u0422\\u041e\\u0420\\u0418\\u0417\\u0410\\u0426\\u0418\\u042f&nbsp;&nbsp;&nbsp;\\u2551
          </span>
        </div>
        <div className="text-center" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#000' }}>
            \\u255a{'\\u2550'.repeat(38)}\\u255d
          </span>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label style={{ color: '#FFFF55', fontFamily: 'VT323, monospace', fontSize: '20px' }}>
              \\u041b\\u043e\\u0433\\u0438\\u043d:{cursorVisible && login === '' ? '\\u2588' : ''}
            </label>
            <input ref={loginRef} type="text" value={login} onChange={e => setLogin(e.target.value)}
              className="w-full px-2 py-1 border-2 outline-none mt-1" style={inputStyle} autoFocus />
          </div>
          <div className="mb-4">
            <label style={{ color: '#FFFF55', fontFamily: 'VT323, monospace', fontSize: '20px' }}>\\u041f\\u0430\\u0440\\u043e\\u043b\\u044c:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-2 py-1 border-2 outline-none mt-1" style={inputStyle} />
          </div>
          {error && <div className="mb-4 p-2 border" style={{ background: '#AA0000', color: '#FFF', borderColor: '#FF5555', fontFamily: 'VT323, monospace', fontSize: '18px' }}>{error}</div>}
          <div className="flex justify-center mt-6">
            <button type="submit" className="px-6 py-1 border-2 cursor-pointer"
              style={{ background: '#AAAAAA', color: '#000', borderColor: '#FFF', fontFamily: 'VT323, monospace', fontSize: '20px' }}>
              [ \\u0412\\u041e\\u0419\\u0422\\u0418 ]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}`;

// ============================================================================
// src/components/Layout.tsx
// ============================================================================
files['src/components/Layout.tsx'] = `import { User, Page } from '../types';
import { exportToXlsx } from '../export';

interface LayoutProps {
  user: User; currentPage: Page;
  onNavigate: (page: Page) => void; onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, currentPage, onNavigate, onLogout, children }: LayoutProps) {
  const menuItems: { key: Page; label: string }[] = [
    { key: 'view', label: '\\u041f\\u0440\\u043e\\u0441\\u043c\\u043e\\u0442\\u0440 \\u041f\\u0423' },
    { key: 'registration', label: '\\u0420\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0430\\u0446\\u0438\\u044f' },
    { key: 'database', label: '\\u0425\\u0411 \\u043f\\u043e \\u041f\\u0423' },
    { key: 'feedback', label: '\\u041e\\u0431\\u0440\\u0430\\u0442\\u043d\\u0430\\u044f \\u0441\\u0432\\u044f\\u0437\\u044c' },
    { key: 'help', label: '\\u0421\\u043f\\u0440\\u0430\\u0432\\u043a\\u0430' },
    { key: 'about', label: '\\u041e \\u043f\\u0440\\u043e\\u0433\\u0440\\u0430\\u043c\\u043c\\u0435' },
  ];

  const handleExport = async () => { await exportToXlsx(); };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#00AAAA' }}>
      <div className="flex items-center px-1 py-0 flex-shrink-0" style={{ background: '#AAAAAA' }}>
        {menuItems.map((item) => (
          <button key={item.key} onClick={() => onNavigate(item.key)}
            className="px-3 py-0 cursor-pointer border-none outline-none"
            style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#000',
              background: currentPage === item.key ? '#FFFF55' : 'transparent',
              fontWeight: currentPage === item.key ? 'bold' : 'normal' }}>
            {item.label}
          </button>
        ))}
        {user.canExport && (
          <button onClick={handleExport} className="px-3 py-0 cursor-pointer border-none outline-none"
            style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#000', background: 'transparent' }}>
            \\u0412\\u044b\\u0433\\u0440\\u0443\\u0437\\u043a\\u0430
          </button>
        )}
        <div className="flex-1" />
        <button onClick={onLogout} className="px-3 py-0 cursor-pointer border-none outline-none"
          style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#000', background: 'transparent' }}>
          \\u0412\\u044b\\u0445\\u043e\\u0434
        </button>
      </div>
      <div className="flex items-center px-2 py-0 flex-shrink-0" style={{ background: '#0000AA' }}>
        <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#FFF' }}>
          \\u041f\\u043e\\u043b\\u044c\\u0437\\u043e\\u0432\\u0430\\u0442\\u0435\\u043b\\u044c: <span style={{ color: '#FFFF55' }}>{user.login}</span>
          {' \\u2502 '}\\u0420\\u043e\\u043b\\u044c: <span style={{ color: '#55FFFF' }}>{user.role === 'root' ? 'ROOT' : user.role === 'admin' ? '\\u0410\\u0414\\u041c\\u0418\\u041d' : '\\u041f\\u041e\\u041b\\u042c\\u0417\\u041e\\u0412\\u0410\\u0422\\u0415\\u041b\\u042c'}</span>
          {' \\u2502 '}\\u0420\\u0435\\u0433\\u0438\\u043e\\u043d\\u044b: <span style={{ color: '#55FF55' }}>{user.regions.join(', ')}</span>
        </span>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
      <div className="flex items-center px-2 py-0 flex-shrink-0" style={{ background: '#AAAAAA' }}>
        <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#000' }}>
          F1-\\u0421\\u043f\\u0440\\u0430\\u0432\\u043a\\u0430 \\u2502 F2-\\u0420\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0430\\u0446\\u0438\\u044f \\u2502 F3-\\u041f\\u0440\\u043e\\u0441\\u043c\\u043e\\u0442\\u0440 \\u041f\\u0423 \\u2502 F10-\\u0412\\u044b\\u0445\\u043e\\u0434
        </span>
        <div className="flex-1" />
        <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#000' }}>\\u041f\\u0423-\\u0420\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0430\\u0442\\u043e\\u0440 v1.0</span>
      </div>
    </div>
  );
}`;

// ============================================================================
// src/components/Feedback.tsx
// ============================================================================
files['src/components/Feedback.tsx'] = `import React, { useState } from 'react';

export default function Feedback() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName(''); setEmail(''); setMessage('');
    setTimeout(() => setSent(false), 5000);
  };

  const inputStyle = { background: '#000', color: '#FFF', borderColor: '#AAA', fontFamily: 'VT323, monospace', fontSize: '18px' };

  return (
    <div className="p-4">
      <div className="border-2" style={{ background: '#0000AA', borderColor: '#FFF', maxWidth: '700px', margin: '0 auto' }}>
        <div className="text-center py-1" style={{ background: '#AAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000' }}>\\u2550\\u2550\\u2550 \\u041e\\u0411\\u0420\\u0410\\u0422\\u041d\\u0410\\u042f \\u0421\\u0412\\u042f\\u0417\\u042c \\u2550\\u2550\\u2550</span>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>\\u0412\\u0430\\u0448\\u0435 \\u0438\\u043c\\u044f:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle} required />
          </div>
          <div className="mb-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle} required />
          </div>
          <div className="mb-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>\\u0421\\u043e\\u043e\\u0431\\u0449\\u0435\\u043d\\u0438\\u0435:</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle} rows={5} required />
          </div>
          {sent && <div className="mb-4 p-2 border" style={{ background: '#005500', color: '#55FF55', borderColor: '#55FF55', fontFamily: 'VT323, monospace', fontSize: '18px' }}>\\u2713 \\u041e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u0435\\u043d\\u043e!</div>}
          <div className="flex justify-center">
            <button type="submit" className="px-6 py-2 border-2 cursor-pointer" style={{ background: '#AAA', color: '#000', borderColor: '#FFF', fontFamily: 'VT323, monospace', fontSize: '20px' }}>[ \\u041e\\u0422\\u041f\\u0420\\u0410\\u0412\\u0418\\u0422\\u042c ]</button>
          </div>
        </form>
      </div>
    </div>
  );
}`;

// ============================================================================
// src/components/Help.tsx
// ============================================================================
files['src/components/Help.tsx'] = `export default function Help() {
  return (
    <div className="p-4">
      <div className="border-2" style={{ background: '#0000AA', borderColor: '#FFF', maxWidth: '800px', margin: '0 auto' }}>
        <div className="text-center py-1" style={{ background: '#AAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000' }}>\\u2550\\u2550\\u2550 \\u0421\\u041f\\u0420\\u0410\\u0412\\u041a\\u0410 \\u2550\\u2550\\u2550</span>
        </div>
        <div className="p-4" style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFF' }}>
          <h2 style={{ color: '#FFFF55', fontSize: '22px' }} className="mb-3">\\u258c \\u041e\\u043f\\u0438\\u0441\\u0430\\u043d\\u0438\\u0435 \\u0441\\u0438\\u0441\\u0442\\u0435\\u043c\\u044b</h2>
          <p className="mb-4">\\u041f\\u0423-\\u0420\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0430\\u0442\\u043e\\u0440 \\u2014 \\u0441\\u0438\\u0441\\u0442\\u0435\\u043c\\u0430 \\u0443\\u0447\\u0451\\u0442\\u0430 \\u043f\\u0440\\u0438\\u0431\\u043e\\u0440\\u043e\\u0432 \\u0443\\u0447\\u0451\\u0442\\u0430 \\u044d\\u043b\\u0435\\u043a\\u0442\\u0440\\u043e\\u044d\\u043d\\u0435\\u0440\\u0433\\u0438\\u0438.</p>
          <h2 style={{ color: '#FFFF55', fontSize: '22px' }} className="mb-3">\\u258c \\u0420\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0430\\u0446\\u0438\\u044f \\u043f\\u0440\\u0438\\u0431\\u043e\\u0440\\u0430</h2>
          <ol className="list-decimal pl-6 mb-4" style={{ color: '#55FFFF' }}>
            <li>\\u0412\\u044b\\u0431\\u0435\\u0440\\u0438\\u0442\\u0435 \\u043a\\u043e\\u0434 \\u0440\\u0435\\u0433\\u0438\\u043e\\u043d\\u0430</li>
            <li>\\u0412\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 \\u043d\\u043e\\u043c\\u0435\\u0440 \\u0411\\u0421 (\\u043a\\u043e\\u0434 + 6 \\u0446\\u0438\\u0444\\u0440)</li>
            <li>\\u0412\\u044b\\u0431\\u0435\\u0440\\u0438\\u0442\\u0435 \\u0442\\u0438\\u043f \\u0434\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u044f</li>
            <li>\\u0412\\u044b\\u0431\\u0435\\u0440\\u0438\\u0442\\u0435 \\u0442\\u0438\\u043f \\u043f\\u0440\\u0438\\u0431\\u043e\\u0440\\u0430 \\u0443\\u0447\\u0451\\u0442\\u0430</li>
            <li>\\u0412\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 \\u043d\\u043e\\u043c\\u0435\\u0440 \\u0441\\u0447\\u0451\\u0442\\u0447\\u0438\\u043a\\u0430 (\\u0434\\u043e 16 \\u0446\\u0438\\u0444\\u0440)</li>
            <li>\\u0423\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435 \\u0442\\u0438\\u043f \\u043c\\u043e\\u0434\\u0435\\u043c\\u0430</li>
            <li>\\u0412\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 \\u043d\\u043e\\u043c\\u0435\\u0440 SIM (7XXXXXXXXXX)</li>
            <li>\\u0423\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435 \\u0430\\u0434\\u0440\\u0435\\u0441</li>
            <li>\\u041d\\u0430\\u0436\\u043c\\u0438\\u0442\\u0435 \\u00ab\\u041e\\u0442\\u043f\\u0440\\u0430\\u0432\\u0438\\u0442\\u044c\\u00bb</li>
          </ol>
          <h2 style={{ color: '#FFFF55', fontSize: '22px' }} className="mb-3">\\u258c \\u0421\\u0442\\u0430\\u0442\\u0443\\u0441\\u044b</h2>
          <p className="mb-4">
            <span style={{ color: '#55FF55' }}>\\u25a0 Ok</span> \\u2014 \\u0441\\u0432\\u0435\\u0442\\u043b\\u043e-\\u0437\\u0435\\u043b\\u0451\\u043d\\u044b\\u0439 \\u0444\\u043e\\u043d<br/>
            <span style={{ color: '#FFFF55' }}>\\u25a0 Error</span> \\u2014 \\u0441\\u0432\\u0435\\u0442\\u043b\\u043e-\\u0436\\u0451\\u043b\\u0442\\u044b\\u0439 \\u0444\\u043e\\u043d
          </p>
          <h2 style={{ color: '#FFFF55', fontSize: '22px' }} className="mb-3">\\u258c \\u0422\\u0430\\u0439\\u043c\\u0430\\u0443\\u0442</h2>
          <p style={{ color: '#55FFFF' }}>\\u041f\\u0440\\u0438 \\u043d\\u0435\\u0430\\u043a\\u0442\\u0438\\u0432\\u043d\\u043e\\u0441\\u0442\\u0438 10 \\u043c\\u0438\\u043d\\u0443\\u0442 \\u0441\\u0435\\u0441\\u0441\\u0438\\u044f \\u0437\\u0430\\u0432\\u0435\\u0440\\u0448\\u0430\\u0435\\u0442\\u0441\\u044f.</p>
        </div>
      </div>
    </div>
  );
}`;

// ============================================================================
// src/components/About.tsx
// ============================================================================
files['src/components/About.tsx'] = `export default function About() {
  return (
    <div className="p-4">
      <div className="border-2" style={{ background: '#0000AA', borderColor: '#FFF', maxWidth: '700px', margin: '0 auto' }}>
        <div className="text-center py-1" style={{ background: '#AAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000' }}>\\u2550\\u2550\\u2550 \\u041e \\u041f\\u0420\\u041e\\u0413\\u0420\\u0410\\u041c\\u041c\\u0415 \\u2550\\u2550\\u2550</span>
        </div>
        <div className="p-6 text-center" style={{ fontFamily: 'VT323, monospace' }}>
          <div className="mt-4" style={{ color: '#FFF', fontSize: '22px' }}>\\u041f\\u0423-\\u0420\\u0415\\u0413\\u0418\\u0421\\u0422\\u0420\\u0410\\u0422\\u041e\\u0420</div>
          <div style={{ color: '#FFFF55', fontSize: '18px' }}>\\u0412\\u0435\\u0440\\u0441\\u0438\\u044f 1.0</div>
          <div className="mt-6 border-t-2 pt-4" style={{ borderColor: '#555', color: '#55FFFF', fontSize: '16px' }}>
            <p>\\u0421\\u0438\\u0441\\u0442\\u0435\\u043c\\u0430 \\u0443\\u0447\\u0451\\u0442\\u0430 \\u043f\\u0440\\u0438\\u0431\\u043e\\u0440\\u043e\\u0432 \\u0443\\u0447\\u0451\\u0442\\u0430 \\u044d\\u043b\\u0435\\u043a\\u0442\\u0440\\u043e\\u044d\\u043d\\u0435\\u0440\\u0433\\u0438\\u0438</p>
          </div>
          <div className="mt-6" style={{ color: '#AAA', fontSize: '14px' }}>
            <p>\\u00a9 2024-2026 \\u0412\\u0441\\u0435 \\u043f\\u0440\\u0430\\u0432\\u0430 \\u0437\\u0430\\u0449\\u0438\\u0449\\u0435\\u043d\\u044b</p>
            <p>\\u0414\\u0438\\u0437\\u0430\\u0439\\u043d: Norton Commander Style</p>
          </div>
        </div>
      </div>
    </div>
  );
}`;

// ============================================================================
// Запись всех файлов
// ============================================================================
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
console.log('  Все файлы созданы! (' + count + ' файлов)');
console.log('========================================');
console.log('');
console.log('Теперь выполните:');
console.log('  npm install');
console.log('  npm run build');
console.log('  node server.js');
console.log('');
console.log('Или просто запустите: start.bat');
console.log('');
