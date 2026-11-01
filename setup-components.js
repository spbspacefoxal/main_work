// ============================================================================
// ПУ-РЕГИСТРАТОР v1.0 — УСТАНОВЩИК КОМПОНЕНТОВ
// ============================================================================
// ЗАПУСТИТЕ ПОСЛЕ setup.js!
// ============================================================================

const fs = require('fs');
const path = require('path');

console.log('');
console.log('========================================');
console.log('  Установка компонентов...');
console.log('========================================');
console.log('');

fs.mkdirSync('src', { recursive: true });
fs.mkdirSync('src/components', { recursive: true });

const files = {};

// ============================================================================
// src/types.ts
// ============================================================================
files['src/types.ts'] = `export type RegionCode = 'AR' | 'MU' | 'PZ' | 'PS' | 'KN' | 'VN' | 'SC' | 'SP' | 'LE' | 'VG';

export const ALL_REGIONS: RegionCode[] = ['AR', 'MU', 'PZ', 'PS', 'KN', 'VN', 'SC', 'SP', 'LE', 'VG'];

export type ActionType = 'Регистрация' | 'Редактирование' | 'Удаление';

export type MeterType =
  | 'Меркурий 234 G7'
  | 'Ротек РТМ-03'
  | 'Ротек РТМ-01'
  | 'Нева 314'
  | 'Нева 412'
  | 'Энергомера CE-303';

export const METER_TYPES: MeterType[] = [
  'Меркурий 234 G7',
  'Ротек РТМ-03',
  'Ротек РТМ-01',
  'Нева 314',
  'Нева 412',
  'Энергомера CE-303',
];

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
    '№': idx + 1,
    'Код региона': r.regionCode,
    'Номер БС': r.bsNumber,
    'Тип действия': r.actionType,
    'Тип прибора учёта': r.meterType,
    'Номер счётчика': r.meterNumber,
    'Тип модема': r.modemType,
    'Номер SIM-карты': r.simCardNumber,
    'Отметка': r.note,
    'Зарегистрировал': r.registeredBy,
    'Дата регистрации': r.registrationDate,
    'Адрес объекта': r.address,
    'Примечание': r.comment,
    'Статус': r.registrationStatus || '—',
    'Дата одобрения': r.statusDate || '',
    'Одобрил': r.statusAdmin || '',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 5 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 20 },
    { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 15 }, { wch: 15 },
    { wch: 20 }, { wch: 40 }, { wch: 30 }, { wch: 10 }, { wch: 20 }, { wch: 15 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Приборы учёта');
  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU').replace(/\\./g, '');
  XLSX.writeFile(wb, 'Регистратор' + dateStr + '.xlsx');
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

// Запись всех файлов
let count = 0;
const total = Object.keys(files).length;

for (const [filePath, content] of Object.entries(files)) {
  const dir = path.dirname(filePath);
  if (dir !== '.') fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
  count++;
  console.log('[' + count + '/' + total + '] ' + filePath);
}

console.log('');
console.log('========================================');
console.log('  Компоненты установлены! (' + count + ' файлов)');
console.log('========================================');
console.log('');
console.log('Теперь скопируйте и запустите setup-ui.js');
console.log('');
