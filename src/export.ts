import * as XLSX from 'xlsx';
import { getRecords } from './db';

export function exportToXlsx(): void {
  const records = getRecords();

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

  // Set column widths
  const colWidths = [
    { wch: 5 },   // №
    { wch: 10 },  // Код региона
    { wch: 12 },  // Номер БС
    { wch: 14 },  // Тип действия
    { wch: 20 },  // Тип прибора учёта
    { wch: 18 },  // Номер счётчика
    { wch: 20 },  // Тип модема
    { wch: 14 },  // Номер SIM-карты
    { wch: 15 },  // Отметка
    { wch: 15 },  // Зарегистрировал
    { wch: 20 },  // Дата регистрации
    { wch: 40 },  // Адрес объекта
    { wch: 30 },  // Примечание
    { wch: 10 },  // Статус
    { wch: 20 },  // Дата одобрения
    { wch: 15 },  // Одобрил
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Приборы учёта');

  // Generate filename: Регистратор + дата в коротком формате
  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU').replace(/\./g, '');
  const fileName = `Регистратор${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
