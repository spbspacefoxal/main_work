import { MeterRecord } from './types';

const DB_KEY = 'meter_records_db';

export function getRecords(): MeterRecord[] {
  const data = localStorage.getItem(DB_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveRecords(records: MeterRecord[]): void {
  localStorage.setItem(DB_KEY, JSON.stringify(records));
}

export function addRecord(record: MeterRecord): void {
  const records = getRecords();
  records.push(record);
  saveRecords(records);
}

export function updateRecord(id: string, updates: Partial<MeterRecord>): void {
  const records = getRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx !== -1) {
    records[idx] = { ...records[idx], ...updates };
    saveRecords(records);
  }
}

export function deleteRecord(id: string): void {
  const records = getRecords();
  saveRecords(records.filter(r => r.id !== id));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function checkMeterNumberExists(meterNumber: string, excludeId?: string): boolean {
  const records = getRecords();
  return records.some(r => r.meterNumber === meterNumber && r.id !== excludeId);
}

export function checkModemExists(modemType: string, excludeId?: string): boolean {
  if (modemType === 'встроенный') return false;
  const records = getRecords();
  return records.some(r => r.modemType === modemType && r.id !== excludeId);
}

export function checkSimCardExists(simCardNumber: string, excludeId?: string): boolean {
  const records = getRecords();
  return records.some(r => r.simCardNumber === simCardNumber && r.id !== excludeId);
}
