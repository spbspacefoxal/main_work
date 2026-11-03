import { MeterRecord, User } from './types';

const API_BASE = '/api';

// Токен хранится в localStorage
let authToken: string | null = localStorage.getItem('auth_token');

export function getToken(): string | null {
  return authToken;
}

export function setToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// ============================================================================
// Авторизация
// ============================================================================

export async function login(login: string, password: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });
    const data = await response.json();
    if (data.success && data.token) {
      setToken(data.token);
      return { success: true, token: data.token, user: data.user };
    }
    return { success: false, error: data.error || 'Ошибка авторизации' };
  } catch (e) {
    return { success: false, error: 'Ошибка соединения с сервером' };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
  } catch (e) {
    // ignore
  }
  setToken(null);
}

export async function checkAuth(): Promise<{ authenticated: boolean; user?: User }> {
  if (!authToken) {
    return { authenticated: false };
  }
  try {
    const response = await fetch(`${API_BASE}/auth/check`, {
      headers: getHeaders(),
    });
    const data = await response.json();
    return data;
  } catch (e) {
    setToken(null);
    return { authenticated: false };
  }
}

// ============================================================================
// Записи
// ============================================================================

export async function getRecords(): Promise<MeterRecord[]> {
  try {
    const response = await fetch(`${API_BASE}/records`, {
      headers: getHeaders(),
    });
    if (response.status === 401) {
      setToken(null);
      return [];
    }
    return await response.json();
  } catch (e) {
    return [];
  }
}

export async function addRecord(record: MeterRecord): Promise<{ success: boolean; id?: string; errors?: Record<string, string>; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(record),
    });
    return await response.json();
  } catch (e) {
    return { success: false, error: 'Ошибка соединения' };
  }
}

export async function updateRecord(id: string, updates: Partial<MeterRecord>): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/records/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return await response.json();
  } catch (e) {
    return { success: false, error: 'Ошибка соединения' };
  }
}

export async function deleteRecord(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/records/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return await response.json();
  } catch (e) {
    return { success: false, error: 'Ошибка соединения' };
  }
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

    const response = await fetch(`${API_BASE}/check?${params.toString()}`, {
      headers: getHeaders(),
    });
    return await response.json();
  } catch (e) {
    return { meterNumberExists: false, modemExists: false, simCardExists: false };
  }
}
