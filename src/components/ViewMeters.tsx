import React, { useState, useEffect, useMemo } from 'react';
import { User, MeterRecord, RegionCode, RegistrationStatus } from '../types';
import { getRecords, updateRecord, deleteRecord } from '../db';

interface ViewMetersProps {
  user: User;
}

interface ColumnFilter {
  [key: string]: string;
}

export default function ViewMeters({ user }: ViewMetersProps) {
  const [records, setRecords] = useState<MeterRecord[]>([]);
  const [filters, setFilters] = useState<ColumnFilter>({});
  const [activeFilterCol, setActiveFilterCol] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<RegistrationStatus>('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const allRecords = getRecords();
    const filtered = allRecords.filter(r => user.regions.includes(r.regionCode));
    setRecords(filtered);
  };

  // Sort: records without "Ok" status first, then by date (newest first for admin)
  const sortedRecords = useMemo(() => {
    const sorted = [...records].sort((a, b) => {
      // Records without "Ok" first
      const aOk = a.registrationStatus === 'Ok' ? 1 : 0;
      const bOk = b.registrationStatus === 'Ok' ? 1 : 0;
      if (aOk !== bOk) return aOk - bOk;

      // For admin/root: newest first (reverse chronological)
      if (user.role === 'admin' || user.role === 'root') {
        return b.id.localeCompare(a.id);
      }
      // For regular users: also newest first
      return b.id.localeCompare(a.id);
    });
    return sorted;
  }, [records, user.role]);

  // Apply filters
  const filteredRecords = useMemo(() => {
    return sortedRecords.filter(record => {
      for (const [col, value] of Object.entries(filters)) {
        if (!value) continue;
        const recordValue = String((record as any)[col] || '').toLowerCase();
        if (!recordValue.includes(value.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [sortedRecords, filters]);

  const handleFilterChange = (col: string, value: string) => {
    setFilters(prev => ({ ...prev, [col]: value }));
  };

  const clearFilter = (col: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[col];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const handleStatusChange = (id: string, status: RegistrationStatus) => {
    setEditingId(id);
    setEditStatus(status);
  };

  const handleStatusSave = (id: string) => {
    const now = new Date().toLocaleString('ru-RU');
    updateRecord(id, {
      registrationStatus: editStatus,
      statusDate: editStatus === 'Ok' ? now : '',
      statusAdmin: editStatus === 'Ok' ? user.login : '',
    });
    setEditingId(null);
    setEditStatus('');
    loadRecords();
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить запись?')) {
      deleteRecord(id);
      loadRecords();
    }
  };

  const getRowBackground = (record: MeterRecord) => {
    if (record.registrationStatus === 'Ok') return '#55AA55';
    if (record.registrationStatus === 'Error') return '#AAAA00';
    return 'transparent';
  };

  const getRowColor = (record: MeterRecord) => {
    if (record.registrationStatus === 'Ok' || record.registrationStatus === 'Error') return '#000000';
    return '#FFFFFF';
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

  return (
    <div className="h-full flex flex-col p-2">
      <div className="border-2 flex-1 flex flex-col overflow-hidden" style={{
        background: '#0000AA',
        borderColor: '#FFFFFF',
      }}>
        {/* Title */}
        <div className="text-center py-1 flex-shrink-0" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000000' }}>
            ═══ ПРОСМОТР ПРИБОРОВ УЧЁТА ═══
          </span>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#000000', marginLeft: '20px' }}>
            Записей: {filteredRecords.length} / {records.length}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-4 px-2 border cursor-pointer"
              style={{
                fontFamily: 'VT323, monospace',
                fontSize: '14px',
                background: '#FF5555',
                color: '#FFFFFF',
                borderColor: '#AA0000',
              }}
            >
              ✕ Сбросить фильтры
            </button>
          )}
        </div>

        {/* Table with scroll */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse" style={{ fontFamily: 'VT323, monospace', fontSize: '14px' }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ background: '#AAAAAA', color: '#000000' }}>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>№</th>
                {columns.map(col => (
                  <th key={col.key} className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA', minWidth: '100px' }}>
                    <div className="flex items-center justify-between">
                      <span>{col.label}</span>
                      <button
                        onClick={() => {
                          if (activeFilterCol === col.key) {
                            setActiveFilterCol(null);
                          } else {
                            setActiveFilterCol(col.key);
                            setFilterSearch(filters[col.key] || '');
                          }
                        }}
                        className="ml-1 cursor-pointer px-1 border"
                        style={{
                          fontSize: '12px',
                          background: filters[col.key] ? '#FFFF55' : '#555555',
                          color: filters[col.key] ? '#000000' : '#FFFFFF',
                          borderColor: '#333333',
                        }}
                        title="Фильтр"
                      >
                        ▼
                      </button>
                    </div>
                    {/* Filter input row */}
                    <div className="mt-1">
                      <input
                        type="text"
                        value={filters[col.key] || ''}
                        onChange={e => handleFilterChange(col.key, e.target.value)}
                        placeholder="Фильтр..."
                        className="w-full px-1 border"
                        style={{
                          background: '#000000',
                          color: '#FFFFFF',
                          borderColor: '#555555',
                          fontFamily: 'VT323, monospace',
                          fontSize: '13px',
                        }}
                      />
                    </div>
                  </th>
                ))}
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>
                  Зарегистрировано
                </th>
                {user.canSetStatus && (
                  <>
                    <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Дата одобр.</th>
                    <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Одобрил</th>
                  </>
                )}
                {user.canDelete && (
                  <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Действия</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, idx) => (
                <tr
                  key={record.id}
                  style={{
                    background: getRowBackground(record),
                    color: getRowColor(record),
                  }}
                >
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{idx + 1}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.regionCode}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.bsNumber}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.actionType}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.meterType}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.meterNumber}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.modemType}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.simCardNumber}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.note}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.registrationDate}</td>
                  <td className="border px-2 py-1 max-w-[200px] truncate" style={{ borderColor: '#555555' }} title={record.address}>{record.address}</td>
                  <td className="border px-2 py-1 max-w-[150px] truncate" style={{ borderColor: '#555555' }} title={record.comment}>{record.comment}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.registeredBy}</td>
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>
                    {user.canSetStatus ? (
                      editingId === record.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value as RegistrationStatus)}
                            className="px-1 py-0 border"
                            style={{
                              background: '#000000',
                              color: '#FFFFFF',
                              fontFamily: 'VT323, monospace',
                              fontSize: '14px',
                            }}
                          >
                            <option value="">—</option>
                            <option value="Ok">Ok</option>
                            <option value="Error">Error</option>
                          </select>
                          <button
                            onClick={() => handleStatusSave(record.id)}
                            className="px-1 border cursor-pointer"
                            style={{ background: '#55FF55', color: '#000000', fontSize: '12px' }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditStatus(''); }}
                            className="px-1 border cursor-pointer"
                            style={{ background: '#FF5555', color: '#FFFFFF', fontSize: '12px' }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(record.id, record.registrationStatus)}
                          className="px-2 border cursor-pointer"
                          style={{
                            background: record.registrationStatus === 'Ok' ? '#55FF55' : record.registrationStatus === 'Error' ? '#FFFF55' : '#555555',
                            color: '#000000',
                            fontSize: '14px',
                            fontFamily: 'VT323, monospace',
                          }}
                        >
                          {record.registrationStatus || '—'}
                        </button>
                      )
                    ) : (
                      <span style={{ fontFamily: 'VT323, monospace' }}>
                        {record.registrationStatus || '—'}
                      </span>
                    )}
                  </td>
                  {user.canSetStatus && (
                    <>
                      <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.statusDate}</td>
                      <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.statusAdmin}</td>
                    </>
                  )}
                  {user.canDelete && (
                    <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="px-1 border cursor-pointer"
                        style={{ background: '#FF5555', color: '#FFFFFF', fontSize: '12px', fontFamily: 'VT323, monospace' }}
                      >
                        DEL
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (user.canSetStatus ? 4 : 1) + (user.canDelete ? 1 : 0)} className="text-center py-4" style={{ color: '#FFFF55', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
                    Нет записей для отображения
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
