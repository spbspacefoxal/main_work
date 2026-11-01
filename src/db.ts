import { MeterRecord } from './types';

const API_BASE = '/api';

// Cache for records
let recordsCache: MeterRecord[] | null = null;

export async function getRecords(): Promise<MeterRecord[]> {
  try {
    const response = await fetch(`${API_BASE}/records`);
    const data = await response.json();
    recordsCache = data;
    return data;
  } catch (e) {
    // Fallback to cache or empty
    return recordsCache || [];
  }
}

export async function addRecord(record: MeterRecord): Promise<void> {
  await fetch(`${API_BASE}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  recordsCache = null; // invalidate cache
}

export async function updateRecord(id: string, updates: Partial<MeterRecord>): Promise<void> {
  await fetch(`${API_BASE}/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  recordsCache = null;
}

export async function deleteRecord(id: string): Promise<void> {
  await fetch(`${API_BASE}/records/${id}`, {
    method: 'DELETE',
  });
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

    const response = await fetch(`${API_BASE}/check?${params.toString()}`);
    return await response.json();
  } catch (e) {
    return { meterNumberExists: false, modemExists: false, simCardExists: false };
  }
}

// Legacy sync functions for compatibility
export function getRecordsSync(): MeterRecord[] {
  return recordsCache || [];
}

export function setRecordsCache(records: MeterRecord[]): void {
  recordsCache = records;
}
