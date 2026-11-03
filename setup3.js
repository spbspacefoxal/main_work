// ============================================================================
// ПУ-РЕГИСТРАТОР v1.0 — УСТАНОВЩИК (ЧАСТЬ 3: VIEWMETERS + DATABASE)
// ============================================================================

const fs = require('fs');
const path = require('path');

console.log('');
console.log('========================================');
console.log('  Установка ViewMeters и Database...');
console.log('========================================');
console.log('');

const files = {};

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
    if (confirm('\\u0423\\u0434\\u0430\\u043b\\u0438\\u0442\\u044c \\u0437\\u0430\\u043f\\u0438\\u0441\\u044c?')) { await deleteRecord(id); await loadRecords(); }
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
    { key: 'regionCode', label: '\\u0420\\u0435\\u0433\\u0438\\u043e\\u043d' },
    { key: 'bsNumber', label: '\\u041d\\u043e\\u043c\\u0435\\u0440 \\u0411\\u0421' },
    { key: 'actionType', label: '\\u0414\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u0435' },
    { key: 'meterType', label: '\\u0422\\u0438\\u043f \\u041f\\u0423' },
    { key: 'meterNumber', label: '\\u2116 \\u0421\\u0447\\u0451\\u0442\\u0447\\u0438\\u043a\\u0430' },
    { key: 'modemType', label: '\\u041c\\u043e\\u0434\\u0435\\u043c' },
    { key: 'simCardNumber', label: 'SIM' },
    { key: 'note', label: '\\u041e\\u0442\\u043c\\u0435\\u0442\\u043a\\u0430' },
    { key: 'registrationDate', label: '\\u0414\\u0430\\u0442\\u0430 \\u0440\\u0435\\u0433.' },
    { key: 'address', label: '\\u0410\\u0434\\u0440\\u0435\\u0441' },
    { key: 'comment', label: '\\u041f\\u0440\\u0438\\u043c\\u0435\\u0447\\u0430\\u043d\\u0438\\u0435' },
    { key: 'registeredBy', label: '\\u041a\\u0435\\u043c \\u0440\\u0435\\u0433.' },
  ];

  const hasActiveFilters = Object.values(filters).some(v => v && v.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span style={{ fontFamily: 'VT323, monospace', fontSize: '24px', color: '#FFFF55' }}>\\u0417\\u0430\\u0433\\u0440\\u0443\\u0437\\u043a\\u0430 \\u0434\\u0430\\u043d\\u043d\\u044b\\u0445...\\u2588</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-2">
      <div className="border-2 flex-1 flex flex-col overflow-hidden" style={{ background: '#0000AA', borderColor: '#FFF' }}>
        <div className="text-center py-1 flex-shrink-0" style={{ background: '#AAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000' }}>\\u2550\\u2550\\u2550 \\u041f\\u0420\\u041e\\u0421\\u041c\\u041e\\u0422\\u0420 \\u041f\\u0420\\u0418\\u0411\\u041e\\u0420\\u041e\\u0412 \\u0423\\u0427\\u0401\\u0422\\u0410 \\u2550\\u2550\\u2550</span>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#000', marginLeft: '20px' }}>\\u0417\\u0430\\u043f\\u0438\\u0441\\u0435\\u0439: {filteredRecords.length} / {records.length}</span>
          {hasActiveFilters && <button onClick={clearAllFilters} className="ml-4 px-2 border cursor-pointer" style={{ fontFamily: 'VT323, monospace', fontSize: '14px', background: '#FF5555', color: '#FFF', borderColor: '#A00' }}>\\u2715 \\u0421\\u0431\\u0440\\u043e\\u0441\\u0438\\u0442\\u044c</button>}
          <button onClick={loadRecords} className="ml-2 px-2 border cursor-pointer" style={{ fontFamily: 'VT323, monospace', fontSize: '14px', background: '#55FFFF', color: '#000', borderColor: '#0AA' }}>\\u21bb \\u041e\\u0431\\u043d\\u043e\\u0432\\u0438\\u0442\\u044c</button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse" style={{ fontFamily: 'VT323, monospace', fontSize: '14px' }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ background: '#AAA', color: '#000' }}>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u2116</th>
                {columns.map(col => (
                  <th key={col.key} className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA', minWidth: '100px' }}>
                    <div>{col.label}</div>
                    <div className="mt-1">
                      <input type="text" value={filters[col.key] || ''} onChange={e => handleFilterChange(col.key, e.target.value)} placeholder="\\u0424\\u0438\\u043b\\u044c\\u0442\\u0440..." className="w-full px-1 border" style={{ background: '#000', color: '#FFF', borderColor: '#555', fontFamily: 'VT323, monospace', fontSize: '13px' }} />
                    </div>
                  </th>
                ))}
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u0417\\u0430\\u0440\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0438\\u0440\\u043e\\u0432\\u0430\\u043d\\u043e</th>
                {user.canSetStatus && <><th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u0414\\u0430\\u0442\\u0430 \\u043e\\u0434\\u043e\\u0431\\u0440.</th><th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u041e\\u0434\\u043e\\u0431\\u0440\\u0438\\u043b</th></>}
                {user.canDelete && <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u0414\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u044f</th>}
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
                            <option value="">\\u2014</option><option value="Ok">Ok</option><option value="Error">Error</option>
                          </select>
                          <button onClick={() => handleStatusSave(record.id)} className="px-1 border cursor-pointer" style={{ background: '#55FF55', color: '#000', fontSize: '12px' }}>\\u2713</button>
                          <button onClick={() => { setEditingId(null); setEditStatus(''); }} className="px-1 border cursor-pointer" style={{ background: '#FF5555', color: '#FFF', fontSize: '12px' }}>\\u2715</button>
                        </div>
                      ) : (
                        <button onClick={() => handleStatusChange(record.id, record.registrationStatus)} className="px-2 border cursor-pointer" style={{ background: record.registrationStatus === 'Ok' ? '#55FF55' : record.registrationStatus === 'Error' ? '#FFFF55' : '#555', color: '#000', fontSize: '14px', fontFamily: 'VT323, monospace' }}>{record.registrationStatus || '\\u2014'}</button>
                      )
                    ) : (<span style={{ fontFamily: 'VT323, monospace' }}>{record.registrationStatus || '\\u2014'}</span>)}
                  </td>
                  {user.canSetStatus && <><td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.statusDate}</td><td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.statusAdmin}</td></>}
                  {user.canDelete && <td className="border px-2 py-1" style={{ borderColor: '#555' }}><button onClick={() => handleDelete(record.id)} className="px-1 border cursor-pointer" style={{ background: '#FF5555', color: '#FFF', fontSize: '12px', fontFamily: 'VT323, monospace' }}>DEL</button></td>}
                </tr>
              ))}
              {filteredRecords.length === 0 && <tr><td colSpan={columns.length + (user.canSetStatus ? 4 : 1) + (user.canDelete ? 1 : 0)} className="text-center py-4" style={{ color: '#FFFF55', fontFamily: 'VT323, monospace', fontSize: '18px' }}>\\u041d\\u0435\\u0442 \\u0437\\u0430\\u043f\\u0438\\u0441\\u0435\\u0439</td></tr>}
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
    if (confirm('\\u0423\\u0434\\u0430\\u043b\\u0438\\u0442\\u044c \\u0437\\u0430\\u043f\\u0438\\u0441\\u044c?')) { await deleteRecord(id); await loadRecords(); }
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
    return (<div className="flex items-center justify-center h-full"><span style={{ fontFamily: 'VT323, monospace', fontSize: '24px', color: '#FFFF55' }}>\\u0417\\u0430\\u0433\\u0440\\u0443\\u0437\\u043a\\u0430...\\u2588</span></div>);
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="border-2 h-full flex flex-col" style={{ background: '#0000AA', borderColor: '#FFF' }}>
        <div className="text-center py-1 flex-shrink-0" style={{ background: '#AAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000' }}>\\u2550\\u2550\\u2550 \\u0425\\u0420\\u0410\\u041d\\u0418\\u041b\\u0418\\u0429\\u0415 \\u0411\\u0410\\u0417\\u042b \\u041f\\u0420\\u0418\\u0411\\u041e\\u0420\\u041e\\u0412 \\u0423\\u0427\\u0401\\u0422\\u0410 \\u2550\\u2550\\u2550</span>
        </div>
        <div className="px-4 py-2 flex items-center gap-4 flex-shrink-0" style={{ background: '#000088' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>\\u0424\\u0438\\u043b\\u044c\\u0442\\u0440 \\u043f\\u043e \\u0440\\u0435\\u0433\\u0438\\u043e\\u043d\\u0443:</span>
          <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className="px-2 py-0 border-2" style={{ background: '#000', color: '#FFF', borderColor: '#AAA', fontFamily: 'VT323, monospace', fontSize: '16px' }}>
            <option value="ALL">\\u0412\\u0441\\u0435 \\u0440\\u0435\\u0433\\u0438\\u043e\\u043d\\u044b</option>
            {user.regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#55FFFF' }}>\\u0417\\u0430\\u043f\\u0438\\u0441\\u0435\\u0439: {filteredRecords.length}</span>
          <button onClick={loadRecords} className="ml-auto px-2 border cursor-pointer" style={{ fontFamily: 'VT323, monospace', fontSize: '14px', background: '#55FFFF', color: '#000', borderColor: '#0AA' }}>\\u21bb \\u041e\\u0431\\u043d\\u043e\\u0432\\u0438\\u0442\\u044c</button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse" style={{ fontFamily: 'VT323, monospace', fontSize: '14px' }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ background: '#AAA', color: '#000' }}>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u2116</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u0420\\u0435\\u0433\\u0438\\u043e\\u043d</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u041d\\u043e\\u043c\\u0435\\u0440 \\u0411\\u0421</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u0414\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u0435</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u0422\\u0438\\u043f \\u041f\\u0423</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u2116 \\u0421\\u0447\\u0451\\u0442\\u0447\\u0438\\u043a\\u0430</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u041c\\u043e\\u0434\\u0435\\u043c</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>SIM</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u041e\\u0442\\u043c\\u0435\\u0442\\u043a\\u0430</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u0414\\u0430\\u0442\\u0430 \\u0440\\u0435\\u0433.</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u0410\\u0434\\u0440\\u0435\\u0441</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u041f\\u0440\\u0438\\u043c\\u0435\\u0447\\u0430\\u043d\\u0438\\u0435</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u0417\\u0430\\u0440\\u0435\\u0433.</th>
                {user.canSetStatus && <><th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u0414\\u0430\\u0442\\u0430 \\u043e\\u0434\\u043e\\u0431\\u0440.</th><th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u041e\\u0434\\u043e\\u0431\\u0440\\u0438\\u043b</th></>}
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u041a\\u0435\\u043c \\u0440\\u0435\\u0433.</th>
                {(user.canDelete || user.canEdit) && <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555', background: '#AAA' }}>\\u0414\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u044f</th>}
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
                            <option value="">\\u2014</option><option value="Ok">Ok</option><option value="Error">Error</option>
                          </select>
                          <button onClick={() => handleStatusSave(record.id)} className="px-1 border cursor-pointer" style={{ background: '#55FF55', color: '#000', fontSize: '12px' }}>\\u2713</button>
                        </div>
                      ) : (
                        <button onClick={() => handleStatusChange(record.id, record.registrationStatus)} className="px-1 border cursor-pointer" style={{ background: record.registrationStatus === 'Ok' ? '#55FF55' : record.registrationStatus === 'Error' ? '#FFFF55' : '#555', color: '#000', fontSize: '14px' }}>{record.registrationStatus || '\\u2014'}</button>
                      )
                    ) : (record.registrationStatus || '\\u2014')}
                  </td>
                  {user.canSetStatus && <><td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.statusDate}</td><td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.statusAdmin}</td></>}
                  <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{record.registeredBy}</td>
                  {(user.canDelete || user.canEdit) && <td className="border px-2 py-1" style={{ borderColor: '#555' }}>{user.canDelete && <button onClick={() => handleDelete(record.id)} className="px-1 border cursor-pointer mr-1" style={{ background: '#FF5555', color: '#FFF', fontSize: '12px' }}>DEL</button>}</td>}
                </tr>
              ))}
              {filteredRecords.length === 0 && <tr><td colSpan={user.canSetStatus ? 17 : 15} className="text-center py-4" style={{ color: '#FFFF55' }}>\\u041d\\u0435\\u0442 \\u0437\\u0430\\u043f\\u0438\\u0441\\u0435\\u0439</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`;

// ============================================================================
// Запись файлов
// ============================================================================
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
console.log('  Все компоненты установлены!');
console.log('========================================');
console.log('');
console.log('Теперь выполните:');
console.log('  npm run build');
console.log('  node server.js');
console.log('');
