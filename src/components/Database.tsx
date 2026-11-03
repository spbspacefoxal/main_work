import React, { useState, useEffect } from 'react';
import { User, MeterRecord, RegistrationStatus } from '../types';
import { getRecords, updateRecord, deleteRecord } from '../db';

interface DatabaseProps {
  user: User;
}

export default function Database({ user }: DatabaseProps) {
  const [records, setRecords] = useState<MeterRecord[]>([]);
  const [filterRegion, setFilterRegion] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<RegistrationStatus>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const allRecords = await getRecords();
    const filtered = allRecords.filter(r => user.regions.includes(r.regionCode));
    setRecords(filtered);
    setLoading(false);
  };

  const handleStatusChange = (id: string, status: RegistrationStatus) => {
    setEditingId(id);
    setEditStatus(status);
  };

  const handleStatusSave = async (id: string) => {
    const now = new Date().toLocaleString('ru-RU');
    await updateRecord(id, {
      registrationStatus: editStatus,
      statusDate: editStatus === 'Ok' ? now : '',
      statusAdmin: editStatus === 'Ok' ? user.login : '',
    });
    setEditingId(null);
    setEditStatus('');
    await loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить запись?')) {
      await deleteRecord(id);
      await loadRecords();
    }
  };

  const filteredRecords = filterRegion === 'ALL'
    ? records
    : records.filter(r => r.regionCode === filterRegion);

  const getRowBackground = (record: MeterRecord) => {
    if (record.registrationStatus === 'Ok') return '#55AA55';
    if (record.registrationStatus === 'Error') return '#AAAA00';
    return 'transparent';
  };

  const getRowColor = (record: MeterRecord) => {
    if (record.registrationStatus === 'Ok' || record.registrationStatus === 'Error') return '#000000';
    return '#FFFFFF';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span style={{ fontFamily: 'VT323, monospace', fontSize: '24px', color: '#FFFF55' }}>
          Загрузка данных...█
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="border-2 h-full flex flex-col" style={{
        background: '#0000AA',
        borderColor: '#FFFFFF',
      }}>
        {/* Title */}
        <div className="text-center py-1 flex-shrink-0" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000000' }}>
            ═══ ХРАНИЛИЩЕ БАЗЫ ПРИБОРОВ УЧЁТА ═══
          </span>
        </div>

        {/* Filter */}
        <div className="px-4 py-2 flex items-center gap-4 flex-shrink-0" style={{ background: '#000088' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
            Фильтр по региону:
          </span>
          <select
            value={filterRegion}
            onChange={e => setFilterRegion(e.target.value)}
            className="px-2 py-0 border-2"
            style={{
              background: '#000000',
              color: '#FFFFFF',
              borderColor: '#AAAAAA',
              fontFamily: 'VT323, monospace',
              fontSize: '16px',
            }}
          >
            <option value="ALL">Все регионы</option>
            {user.regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#55FFFF' }}>
            Записей: {filteredRecords.length}
          </span>
          <button
            onClick={loadRecords}
            className="ml-auto px-2 border cursor-pointer"
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: '14px',
              background: '#55FFFF',
              color: '#000000',
              borderColor: '#00AAAA',
            }}
          >
            ↻ Обновить
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse" style={{ fontFamily: 'VT323, monospace', fontSize: '14px' }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ background: '#AAAAAA', color: '#000000' }}>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>№</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Регион</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Номер БС</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Действие</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Тип ПУ</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>№ Счётчика</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Модем</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>SIM</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Отметка</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Дата рег.</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Адрес</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Примечание</th>
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Зарег.</th>
                {user.canSetStatus && (
                  <>
                    <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Дата одобр.</th>
                    <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Одобрил</th>
                  </>
                )}
                <th className="border px-2 py-1 text-left sticky top-0" style={{ borderColor: '#555555', background: '#AAAAAA' }}>Кем рег.</th>
                {(user.canDelete || user.canEdit) && (
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
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(record.id, record.registrationStatus)}
                          className="px-1 border cursor-pointer"
                          style={{
                            background: record.registrationStatus === 'Ok' ? '#55FF55' : record.registrationStatus === 'Error' ? '#FFFF55' : '#555555',
                            color: '#000000',
                            fontSize: '14px',
                          }}
                        >
                          {record.registrationStatus || '—'}
                        </button>
                      )
                    ) : (
                      record.registrationStatus || '—'
                    )}
                  </td>
                  {user.canSetStatus && (
                    <>
                      <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.statusDate}</td>
                      <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.statusAdmin}</td>
                    </>
                  )}
                  <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>{record.registeredBy}</td>
                  {(user.canDelete || user.canEdit) && (
                    <td className="border px-2 py-1" style={{ borderColor: '#555555' }}>
                      {user.canDelete && (
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="px-1 border cursor-pointer mr-1"
                          style={{ background: '#FF5555', color: '#FFFFFF', fontSize: '12px' }}
                        >
                          DEL
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={user.canSetStatus ? 17 : 15} className="text-center py-4" style={{ color: '#FFFF55' }}>
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
