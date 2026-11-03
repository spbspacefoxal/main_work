// ============================================================================
// ПУ-РЕГИСТРАТОР v1.0 — УСТАНОВЩИК ОСНОВНЫХ КОМПОНЕНТОВ
// ============================================================================
// ЗАПУСТИТЕ ПОСЛЕ setup-ui.js!
// ============================================================================

const fs = require('fs');
const path = require('path');

console.log('');
console.log('========================================');
console.log('  Установка основных компонентов...');
console.log('========================================');
console.log('');

fs.mkdirSync('src/components', { recursive: true });

const files = {};

// ============================================================================
// src/components/Registration.tsx
// ============================================================================
files['src/components/Registration.tsx'] = `import React, { useState, useEffect } from 'react';
import { User, RegionCode, ActionType, MeterType, METER_TYPES, MeterRecord } from '../types';
import { addRecord, checkDuplicates, generateId } from '../db';

interface RegistrationProps { user: User; }

export default function Registration({ user }: RegistrationProps) {
  const [regionCode, setRegionCode] = useState<RegionCode>(user.regions[0]);
  const [bsNumber, setBsNumber] = useState('');
  const [actionType, setActionType] = useState<ActionType>('Регистрация');
  const [meterType, setMeterType] = useState<MeterType>(METER_TYPES[0]);
  const [meterNumber, setMeterNumber] = useState('');
  const [modemMode, setModemMode] = useState<'встроенный' | 'custom'>('встроенный');
  const [modemNumber, setModemNumber] = useState('');
  const [simCardNumber, setSimCardNumber] = useState('');
  const [note, setNote] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setBsNumber(regionCode); }, [regionCode]);

  const getModemType = (): string => { return modemMode === 'встроенный' ? 'встроенный' : modemNumber; };

  const normalizeSimCard = (value: string): string => {
    let v = value.replace(/[^0-9+]/g, '');
    if (v.startsWith('+')) v = v.substring(1);
    if (v.startsWith('8') && v.length >= 11) v = '7' + v.substring(1);
    return v;
  };

  const validate = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
    if (!bsNumber.startsWith(regionCode)) newErrors.bsNumber = 'Номер БС должен начинаться с кода региона';
    else if (bsNumber.length !== regionCode.length + 6) newErrors.bsNumber = 'Номер БС = код + 6 цифр';
    else { const digits = bsNumber.substring(regionCode.length); if (!/^\\d{6}$/.test(digits)) newErrors.bsNumber = 'После кода должно быть 6 цифр'; }

    if (!meterNumber) newErrors.meterNumber = 'Введите номер счётчика';
    else if (!/^\\d{1,16}$/.test(meterNumber)) newErrors.meterNumber = 'Номер: до 16 цифр';

    if (modemMode === 'custom') {
      if (!modemNumber) newErrors.modemType = 'Введите номер модема';
      else if (!/^\\d{4,20}$/.test(modemNumber)) newErrors.modemType = 'Номер: от 4 до 20 цифр';
    }

    const normalizedSim = normalizeSimCard(simCardNumber);
    if (!normalizedSim) newErrors.simCardNumber = 'Введите номер SIM';
    else if (!/^7\\d{10}$/.test(normalizedSim)) newErrors.simCardNumber = 'Номер: 11 цифр, начиная с 7';

    if (!address.trim()) newErrors.address = 'Введите адрес';
    else if (address.length > 1000) newErrors.address = 'Адрес не более 1000 символов';

    if (comment.length > 1000) newErrors.comment = 'Примечание не более 1000 символов';

    if (Object.keys(newErrors).length === 0) {
      const duplicates = await checkDuplicates(meterNumber, getModemType(), normalizedSim);
      if (duplicates.meterNumberExists) newErrors.meterNumber = 'Номер счётчика уже есть в базе!';
      if (duplicates.modemExists) newErrors.modemType = 'Номер модема уже есть в базе!';
      if (duplicates.simCardExists) newErrors.simCardNumber = 'Номер SIM уже есть в базе!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    if (!(await validate())) return;

    const normalizedSim = normalizeSimCard(simCardNumber);
    const now = new Date();
    const dateStr = now.toLocaleString('ru-RU');

    const record: MeterRecord = {
      id: generateId(), regionCode, bsNumber, actionType, meterType, meterNumber,
      modemType: getModemType(), simCardNumber: normalizedSim, note, registrationDate: dateStr,
      address, comment, registeredBy: user.login, registrationStatus: '', statusDate: '', statusAdmin: '',
    };

    await addRecord(record);
    setSuccess('✓ Заявка успешно отправлена!');
    setBsNumber(regionCode); setMeterNumber(''); setModemMode('встроенный');
    setModemNumber(''); setSimCardNumber(''); setNote(''); setAddress(''); setComment(''); setErrors({});
    setTimeout(() => setSuccess(''), 5000);
  };

  const inputStyle = (hasError: boolean) => ({ background: '#000', color: '#FFF', borderColor: hasError ? '#FF5555' : '#AAA', fontFamily: 'VT323, monospace', fontSize: '18px' });
  const selectStyle = (hasError: boolean) => ({ background: '#000', color: '#FFF', borderColor: hasError ? '#FF5555' : '#AAA', fontFamily: 'VT323, monospace', fontSize: '18px' });

  return (
    <div className="p-4 overflow-auto h-full">
      <div className="border-2" style={{ background: '#0000AA', borderColor: '#FFF', maxWidth: '900px', margin: '0 auto' }}>
        <div className="text-center py-1" style={{ background: '#AAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000' }}>═══ РЕГИСТРАЦИЯ ПРИБОРА УЧЁТА ═══</span>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>1. Код региона:</label>
              <select value={regionCode} onChange={e => setRegionCode(e.target.value as RegionCode)} className="w-full px-2 py-1 border-2 mt-1" style={selectStyle(false)}>
                {user.regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>2. Номер БС:</label>
              <input type="text" value={bsNumber} onChange={e => setBsNumber(e.target.value.toUpperCase())} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.bsNumber)} placeholder={regionCode + ' + 6 цифр'} />
              {errors.bsNumber && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.bsNumber}</span>}
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>3. Тип действия:</label>
              <select value={actionType} onChange={e => setActionType(e.target.value as ActionType)} className="w-full px-2 py-1 border-2 mt-1" style={selectStyle(false)}>
                <option value="Регистрация">Регистрация</option>
                <option value="Редактирование">Редактирование</option>
                <option value="Удаление">Удаление</option>
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>4. Тип прибора:</label>
              <select value={meterType} onChange={e => setMeterType(e.target.value as MeterType)} className="w-full px-2 py-1 border-2 mt-1" style={selectStyle(false)}>
                {METER_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>5. Номер счётчика{cursorVisible ? '█' : ''}:</label>
              <input type="text" value={meterNumber} onChange={e => setMeterNumber(e.target.value.replace(/[^0-9]/g, '').substring(0, 16))} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.meterNumber)} placeholder="до 16 цифр" />
              {errors.meterNumber && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.meterNumber}</span>}
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>6. Тип модема:</label>
              <select value={modemMode} onChange={e => setModemMode(e.target.value as any)} className="w-full px-2 py-1 border-2 mt-1" style={selectStyle(!!errors.modemType)}>
                <option value="встроенный">встроенный</option>
                <option value="custom">Указать номер</option>
              </select>
              {modemMode === 'custom' && <input type="text" value={modemNumber} onChange={e => setModemNumber(e.target.value.replace(/[^0-9]/g, '').substring(0, 20))} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.modemType)} placeholder="номер 4-20 цифр" />}
              {errors.modemType && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.modemType}</span>}
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>7. Номер SIM:</label>
              <input type="text" value={simCardNumber} onChange={e => setSimCardNumber(e.target.value)} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.simCardNumber)} placeholder="79001112233" />
              {errors.simCardNumber && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.simCardNumber}</span>}
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>8. Отметка:</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(false)} readOnly />
            </div>
          </div>
          <div className="mt-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>10. Адрес:</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.address)} rows={2} maxLength={1000} />
            {errors.address && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.address}</span>}
          </div>
          <div className="mt-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>11. Примечание:</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.comment)} rows={2} maxLength={1000} />
            {errors.comment && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.comment}</span>}
          </div>
          {success && <div className="mt-4 p-2 border" style={{ background: '#005500', color: '#55FF55', borderColor: '#55FF55', fontFamily: 'VT323, monospace', fontSize: '18px' }}>{success}</div>}
          <div className="flex justify-center mt-6">
            <button type="submit" className="px-6 py-2 border-2 cursor-pointer" style={{ background: '#AAA', color: '#000', borderColor: '#FFF', fontFamily: 'VT323, monospace', fontSize: '20px' }}>[ ОТПРАВИТЬ ЗАЯВКУ ]</button>
          </div>
        </form>
      </div>
    </div>
  );
}`;

// ============================================================================
// src/components/ViewMeters.tsx
// ============================================================================
files['src/components/ViewMeters.tsx'] = `import React, { useState, useEffect, useMemo } from 'react';
import { User, MeterRecord, RegistrationStatus } from '../types';
import { getRecords, updateRecord, deleteRecord } from '../db';

interface ViewMetersProps { user: User; }
interface ColumnFilter { [key: string]: string; }

export default function ViewMeters({ user }: ViewMetersProps) {
  const [records, setRecords] = useState<MeterRecord[]>([]);
  const [filters, setFilters] = useState<ColumnFilter>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<RegistrationStatus>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    setLoading(true);
    const allRecords = await getRecords();
    const filtered = allRecords.filter(r => user.regions.includes(r.regionCode));
    setRecords(filtered);
    setLoading(false);
  };

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const aOk = a.registrationStatus === 'Ok' ? 1 : 0;
      const bOk = b.registrationStatus === 'Ok' ? 1 : 0;
      if (aOk !== bOk) return aOk - bOk;
      return b.id.localeCompare(a.id);
    });
  }, [records]);

  const filteredRecords = useMemo(() => {
    return sortedRecords.filter(record => {
      for (const [col, value] of Object.entries(filters)) {
        if (!value) continue;
        const recordValue = String((record as any)[col] || '').toLowerCase();
        if (!recordValue.includes(value.toLowerCase())) return false;
      }
      return true;
    });
  }, [sortedRecords, filters]);

  const handleFilterChange = (col: string, value: string) => { setFilters(prev => ({ ...prev, [col]: value })); };
  const clearAllFilters = () => { setFilters({}); };

  const handleStatusChange = (id: string, status: RegistrationStatus) => { setEditingId(id); setEditStatus(status); };

  const handleStatusSave = async (id: string) => {
    const now = new Date().toLocaleString('ru-RU');
    await updateRecord(id, { registrationStatus: editStatus, statusDate: editStatus === 'Ok' ? now : '', statusAdmin: editStatus === 'Ok' ? user.login : '' });
    setEditingId(null); setEditStatus('');
    await loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить запись?')) { await deleteRecord(id); await loadRecords(); }
  };

  const getRowBackground = (record: MeterRecord) => {
    if (record.registrationStatus === 'Ok') return '#55AA55';
    if (record.registrationStatus === 'Error') return '#AAAA00';
    return 'transparent';
  };

  const getRowColor = (record: MeterRecord) => {
    if (record.registrationStatus === 'Ok' || record.registrationStatus === 'Error') return '#000';
    return '#FFF';
  };

  const columns = [
    { key: 'regionCode', label: 'Регион' },
    { key: 'bsNumber', label: 'Номер БС' },
    { key: 'actionType', label: 'Действие' },
    { key: 'meterType', label: 'Тип ПУ' },
    { key: 'meterNumber', label: '№ Счётчика' },
    { key: 'modemType', label: 'Модем' },
    { key: 'simCardNumber', label: 'SIM' },
    { key: 'note', label: 'Отметка' },
    { key: 'registrationDate', label: 'Дата рег.' },
    { key: 'address', label: 'Адрес' },
    { key: 'comment', label: 'Примечание' },
    { key: 'registeredBy', label: 'Кем рег.' },
  ];

  const hasActiveFilters = Object.values(filters).some(v => v && v.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span style={{ fontFamily: 'VT323, monospace', fontSize: '24px', color: '#FFFF55' }}>Загрузка данных...█</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-2">
      <div className="border-2 flex-1 flex flex-col overflow-hidden" style={{ background: '#0000AA', borderColor: '#FFF' }}>
        <div className="text-center py-1 flex-shrink-0" style={{ background: '#AAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000' }}>═══ ПРОСМОТР ПРИБОРОВ УЧЁТА ═══</span>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#000', marginLeft: '20px' }}>Записей: {filteredRecords.length} / {records.length}</span>
          {hasActiveFilters && <button onClick={clearAllFilters} className="ml-4 px-2 border cursor-pointer" style={{ fontFamily: 'VT323, monospace', fontSize: '14px', background: '#FF5555', color: '#FFF', borderColor: '#A00' }}>✕ Сбросить</button>}
          <button onClick={loadRecords} className="ml-2 px-2 border cursor-pointer" style={{ fontFamily: 'VT323, monospace', fontSize: '14px', background: '#55FFFF', color: '#000', borderColor: '#0AA' }}>↻ Обновить</button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse" style={{ fontFamily: 'VT323, monospace', fontSize: '14px' }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ background: '#AAA', color: '#000' }}>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>№</th>
                {columns.map(col => (
                  <th key={col.key} className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA', minWidth: '100px' }}>
                    <div>{col.label}</div>
                    <div className="mt-1">
                      <input type="text" value={filters[col.key] || ''} onChange={e => handleFilterChange(col.key, e.target.value)} placeholder="Фильтр..." className="w-full px-1 border" style={{ background: '#000', color: '#FFF', borderColor: '#555', fontFamily: 'VT323, monospace', fontSize: '13px' }} />
                    </div>
                  </th>
                ))}
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Зарегистрировано</th>
                {user.canSetStatus && <><th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Дата одобр.</th><th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Одобрил</th></>}
                {user.canDelete && <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, idx) => (
                <tr key={record.id} style={{ background: getRowBackground(record), color: getRowColor(record) }}>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{idx + 1}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.regionCode}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.bsNumber}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.actionType}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.meterType}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.meterNumber}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.modemType}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.simCardNumber}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.note}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.registrationDate}</td>
                  <td className="border px-2 py-1 max-w-[200px] truncate" style={{ borderColor: '#555' }} title={record.address}>{record.address}</td>
                  <td className="border px-2 py-1 max-w-[150px] truncate" style={{ borderColor: '#555' }} title={record.comment}>{record.comment}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.registeredBy}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>
                    {user.canSetStatus ? (
                      editingId === record.id ? (
                        <div className="flex items-center gap-1">
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value as RegistrationStatus)} className="px-1 py-0 border" style={{ background: '#000', color: '#FFF', fontFamily: 'VT323, monospace', fontSize: '14px' }}>
                            <option value="">—</option><option value="Ok">Ok</option><option value="Error">Error</option>
                          </select>
                          <button onClick={() => handleStatusSave(record.id)} className="px-1 border cursor-pointer" style={{ background: '#55FF55', color: '#000', fontSize: '12px' }}>✓</button>
                          <button onClick={() => { setEditingId(null); setEditStatus(''); }} className="px-1 border cursor-pointer" style={{ background: '#FF5555', color: '#FFF', fontSize: '12px' }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => handleStatusChange(record.id, record.registrationStatus)} className="px-2 border cursor-pointer" style={{ background: record.registrationStatus === 'Ok' ? '#55FF55' : record.registrationStatus === 'Error' ? '#FFFF55' : '#555', color: '#000', fontSize: '14px', fontFamily: 'VT323, monospace' }}>{record.registrationStatus || '—'}</button>
                      )
                    ) : (<span style={{ fontFamily: 'VT323, monospace' }}>{record.registrationStatus || '—'}</span>)}
                  </td>
                  {user.canSetStatus && <><td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.statusDate}</td><td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.statusAdmin}</td></>}
                  {user.canDelete && <td className="border px-2 py-1" style={{ borderColor: '#555' }}><button onClick={() => handleDelete(record.id)} className="px-1 border cursor-pointer" style={{ background: '#FF5555', color: '#FFF', fontSize: '12px', fontFamily: 'VT323, monospace' }}>DEL</button></td>}
                </tr>
              ))}
              {filteredRecords.length === 0 && <tr><td colSpan={columns.length + (user.canSetStatus ? 4 : 1) + (user.canDelete ? 1 : 0)} className="text-center py-4" style={{ color: '#FFFF55', fontFamily: 'VT323, monospace', fontSize: '18px' }}>Нет записей</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`;

// ============================================================================
// src/components/Database.tsx
// ============================================================================
files['src/components/Database.tsx'] = `import React, { useState, useEffect } from 'react';
import { User, MeterRecord, RegistrationStatus } from '../types';
import { getRecords, updateRecord, deleteRecord } from '../db';

interface DatabaseProps { user: User; }

export default function Database({ user }: DatabaseProps) {
  const [records, setRecords] = useState<MeterRecord[]>([]);
  const [filterRegion, setFilterRegion] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<RegistrationStatus>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    setLoading(true);
    const allRecords = await getRecords();
    const filtered = allRecords.filter(r => user.regions.includes(r.regionCode));
    setRecords(filtered);
    setLoading(false);
  };

  const handleStatusChange = (id: string, status: RegistrationStatus) => { setEditingId(id); setEditStatus(status); };

  const handleStatusSave = async (id: string) => {
    const now = new Date().toLocaleString('ru-RU');
    await updateRecord(id, { registrationStatus: editStatus, statusDate: editStatus === 'Ok' ? now : '', statusAdmin: editStatus === 'Ok' ? user.login : '' });
    setEditingId(null); setEditStatus('');
    await loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить запись?')) { await deleteRecord(id); await loadRecords(); }
  };

  const filteredRecords = filterRegion === 'ALL' ? records : records.filter(r => r.regionCode === filterRegion);

  const getRowBackground = (record: MeterRecord) => {
    if (record.registrationStatus === 'Ok') return '#55AA55';
    if (record.registrationStatus === 'Error') return '#AAAA00';
    return 'transparent';
  };

  const getRowColor = (record: MeterRecord) => {
    if (record.registrationStatus === 'Ok' || record.registrationStatus === 'Error') return '#000';
    return '#FFF';
  };

  if (loading) {
    return (<div className="flex items-center justify-center h-full"><span style={{ fontFamily: 'VT323, monospace', fontSize: '24px', color: '#FFFF55' }}>Загрузка...█</span></div>);
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="border-2 h-full flex flex-col" style={{ background: '#0000AA', borderColor: '#FFF' }}>
        <div className="text-center py-1 flex-shrink-0" style={{ background: '#AAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000' }}>═══ ХРАНИЛИЩЕ БАЗЫ ПРИБОРОВ УЧЁТА ═══</span>
        </div>
        <div className="px-4 py-2 flex items-center gap-4 flex-shrink-0" style={{ background: '#000088' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>Фильтр по региону:</span>
          <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className="px-2 py-0 border-2" style={{ background: '#000', color: '#FFF', borderColor: '#AAA', fontFamily: 'VT323, monospace', fontSize: '16px' }}>
            <option value="ALL">Все регионы</option>
            {user.regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#55FFFF' }}>Записей: {filteredRecords.length}</span>
          <button onClick={loadRecords} className="ml-auto px-2 border cursor-pointer" style={{ fontFamily: 'VT323, monospace', fontSize: '14px', background: '#55FFFF', color: '#000', borderColor: '#0AA' }}>↻ Обновить</button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse" style={{ fontFamily: 'VT323, monospace', fontSize: '14px' }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ background: '#AAA', color: '#000' }}>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>№</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Регион</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Номер БС</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Действие</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Тип ПУ</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>№ Счётчика</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Модем</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>SIM</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Отметка</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Дата рег.</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Адрес</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Примечание</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Зарег.</th>
                {user.canSetStatus && <><th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Дата одобр.</th><th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Одобрил</th></>}
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Кем рег.</th>
                {(user.canDelete || user.canEdit) && <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, idx) => (
                <tr key={record.id} style={{ background: getRowBackground(record), color: getRowColor(record) }}>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{idx + 1}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.regionCode}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.bsNumber}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.actionType}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.meterType}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.meterNumber}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.modemType}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.simCardNumber}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.note}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.registrationDate}</td>
                  <td className="border px-2 py-1 max-w-[200px] truncate" style={{ borderColor: '#555' }} title={record.address}>{record.address}</td>
                  <td className="border px-2 py-1 max-w-[150px] truncate" style={{ borderColor: '#555' }} title={record.comment}>{record.comment}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>
                    {user.canSetStatus ? (
                      editingId === record.id ? (
                        <div className="flex items-center gap-1">
                          <select value={editStatus} onChange={e => setEditStatus(e.target.value as RegistrationStatus)} className="px-1 py-0 border" style={{ background: '#000', color: '#FFF', fontFamily: 'VT323, monospace', fontSize: '14px' }}>
                            <option value="">—</option><option value="Ok">Ok</option><option value="Error">Error</option>
                          </select>
                          <button onClick={() => handleStatusSave(record.id)} className="px-1 border cursor-pointer" style={{ background: '#55FF55', color: '#000', fontSize: '12px' }}>✓</button>
                        </div>
                      ) : (
                        <button onClick={() => handleStatusChange(record.id, record.registrationStatus)} className="px-1 border cursor-pointer" style={{ background: record.registrationStatus === 'Ok' ? '#55FF55' : record.registrationStatus === 'Error' ? '#FFFF55' : '#555', color: '#000', fontSize: '14px' }}>{record.registrationStatus || '—'}</button>
                      )
                    ) : (record.registrationStatus || '—')}
                  </td>
                  {user.canSetStatus && <><td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.statusDate}</td><td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.statusAdmin}</td></>}
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.registeredBy}</td>
                  {(user.canDelete || user.canEdit) && <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{user.canDelete && <button onClick={() => handleDelete(record.id)} className="px-1 border cursor-pointer mr-1" style={{ background: '#FF5555', color: '#FFF', fontSize: '12px' }}>DEL</button>}</td>}
                </tr>
              ))}
              {filteredRecords.length === 0 && <tr><td colSpan={user.canSetStatus ? 17 : 15} className="text-center py-4" style={{ color: '#FFFF55' }}>Нет записей</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
console.log('  Все компоненты установлены! (' + count + ' файлов)');
console.log('========================================');
console.log('');
console.log('Теперь выполните:');
console.log('  npm run build');
console.log('  node server.js');
console.log('');
console.log('Или просто запустите: start.bat');
console.log('');
