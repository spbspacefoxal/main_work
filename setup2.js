// ============================================================================
// ПУ-РЕГИСТРАТОР v1.0 — УСТАНОВЩИК (ЧАСТЬ 2: КОМПОНЕНТЫ)
// ============================================================================
// ИНСТРУКЦИЯ:
// 1. Сначала запустите setup.js (он создаст базовые файлы)
// 2. Затем запустите setup2.js (он создаст компоненты)
// ============================================================================

const fs = require('fs');
const path = require('path');

console.log('');
console.log('========================================');
console.log('  Установка компонентов...');
console.log('========================================');
console.log('');

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
  const [actionType, setActionType] = useState<ActionType>('\\u0420\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0430\\u0446\\u0438\\u044f');
  const [meterType, setMeterType] = useState<MeterType>(METER_TYPES[0]);
  const [meterNumber, setMeterNumber] = useState('');
  const [modemMode, setModemMode] = useState<'\\u0432\\u0441\\u0442\\u0440\\u043e\\u0435\\u043d\\u043d\\u044b\\u0439' | 'custom'>('\\u0432\\u0441\\u0442\\u0440\\u043e\\u0435\\u043d\\u043d\\u044b\\u0439');
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

  const getModemType = (): string => { return modemMode === '\\u0432\\u0441\\u0442\\u0440\\u043e\\u0435\\u043d\\u043d\\u044b\\u0439' ? '\\u0432\\u0441\\u0442\\u0440\\u043e\\u0435\\u043d\\u043d\\u044b\\u0439' : modemNumber; };

  const normalizeSimCard = (value: string): string => {
    let v = value.replace(/[^0-9+]/g, '');
    if (v.startsWith('+')) v = v.substring(1);
    if (v.startsWith('8') && v.length >= 11) v = '7' + v.substring(1);
    return v;
  };

  const validate = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
    if (!bsNumber.startsWith(regionCode)) newErrors.bsNumber = '\\u041d\\u043e\\u043c\\u0435\\u0440 \\u0411\\u0421 \\u0434\\u043e\\u043b\\u0436\\u0435\\u043d \\u043d\\u0430\\u0447\\u0438\\u043d\\u0430\\u0442\\u044c\\u0441\\u044f \\u0441 \\u043a\\u043e\\u0434\\u0430 \\u0440\\u0435\\u0433\\u0438\\u043e\\u043d\\u0430';
    else if (bsNumber.length !== regionCode.length + 6) newErrors.bsNumber = '\\u041d\\u043e\\u043c\\u0435\\u0440 \\u0411\\u0421 = \\u043a\\u043e\\u0434 + 6 \\u0446\\u0438\\u0444\\u0440';
    else { const digits = bsNumber.substring(regionCode.length); if (!/^\\d{6}$/.test(digits)) newErrors.bsNumber = '\\u041f\\u043e\\u0441\\u043b\\u0435 \\u043a\\u043e\\u0434\\u0430 \\u0434\\u043e\\u043b\\u0436\\u043d\\u043e \\u0431\\u044b\\u0442\\u044c 6 \\u0446\\u0438\\u0444\\u0440'; }

    if (!meterNumber) newErrors.meterNumber = '\\u0412\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 \\u043d\\u043e\\u043c\\u0435\\u0440 \\u0441\\u0447\\u0451\\u0442\\u0447\\u0438\\u043a\\u0430';
    else if (!/^\\d{1,16}$/.test(meterNumber)) newErrors.meterNumber = '\\u041d\\u043e\\u043c\\u0435\\u0440: \\u0434\\u043e 16 \\u0446\\u0438\\u0444\\u0440';

    if (modemMode === 'custom') {
      if (!modemNumber) newErrors.modemType = '\\u0412\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 \\u043d\\u043e\\u043c\\u0435\\u0440 \\u043c\\u043e\\u0434\\u0435\\u043c\\u0430';
      else if (!/^\\d{4,20}$/.test(modemNumber)) newErrors.modemType = '\\u041d\\u043e\\u043c\\u0435\\u0440: \\u043e\\u0442 4 \\u0434\\u043e 20 \\u0446\\u0438\\u0444\\u0440';
    }

    const normalizedSim = normalizeSimCard(simCardNumber);
    if (!normalizedSim) newErrors.simCardNumber = '\\u0412\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 \\u043d\\u043e\\u043c\\u0435\\u0440 SIM';
    else if (!/^7\\d{10}$/.test(normalizedSim)) newErrors.simCardNumber = '\\u041d\\u043e\\u043c\\u0435\\u0440: 11 \\u0446\\u0438\\u0444\\u0440, \\u043d\\u0430\\u0447\\u0438\\u043d\\u0430\\u044f \\u0441 7';

    if (!address.trim()) newErrors.address = '\\u0412\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 \\u0430\\u0434\\u0440\\u0435\\u0441';
    else if (address.length > 1000) newErrors.address = '\\u0410\\u0434\\u0440\\u0435\\u0441 \\u043d\\u0435 \\u0431\\u043e\\u043b\\u0435\\u0435 1000 \\u0441\\u0438\\u043c\\u0432\\u043e\\u043b\\u043e\\u0432';

    if (comment.length > 1000) newErrors.comment = '\\u041f\\u0440\\u0438\\u043c\\u0435\\u0447\\u0430\\u043d\\u0438\\u0435 \\u043d\\u0435 \\u0431\\u043e\\u043b\\u0435\\u0435 1000 \\u0441\\u0438\\u043c\\u0432\\u043e\\u043b\\u043e\\u0432';

    if (Object.keys(newErrors).length === 0) {
      const duplicates = await checkDuplicates(meterNumber, getModemType(), normalizedSim);
      if (duplicates.meterNumberExists) newErrors.meterNumber = '\\u041d\\u043e\\u043c\\u0435\\u0440 \\u0441\\u0447\\u0451\\u0442\\u0447\\u0438\\u043a\\u0430 \\u0443\\u0436\\u0435 \\u0435\\u0441\\u0442\\u044c \\u0432 \\u0431\\u0430\\u0437\\u0435!';
      if (duplicates.modemExists) newErrors.modemType = '\\u041d\\u043e\\u043c\\u0435\\u0440 \\u043c\\u043e\\u0434\\u0435\\u043c\\u0430 \\u0443\\u0436\\u0435 \\u0435\\u0441\\u0442\\u044c \\u0432 \\u0431\\u0430\\u0437\\u0435!';
      if (duplicates.simCardExists) newErrors.simCardNumber = '\\u041d\\u043e\\u043c\\u0435\\u0440 SIM \\u0443\\u0436\\u0435 \\u0435\\u0441\\u0442\\u044c \\u0432 \\u0431\\u0430\\u0437\\u0435!';
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
    setSuccess('\\u2713 \\u0417\\u0430\\u044f\\u0432\\u043a\\u0430 \\u0443\\u0441\\u043f\\u0435\\u0448\\u043d\\u043e \\u043e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u0435\\u043d\\u0430!');
    setBsNumber(regionCode); setMeterNumber(''); setModemMode('\\u0432\\u0441\\u0442\\u0440\\u043e\\u0435\\u043d\\u043d\\u044b\\u0439');
    setModemNumber(''); setSimCardNumber(''); setNote(''); setAddress(''); setComment(''); setErrors({});
    setTimeout(() => setSuccess(''), 5000);
  };

  const inputStyle = (hasError: boolean) => ({ background: '#000', color: '#FFF', borderColor: hasError ? '#FF5555' : '#AAA', fontFamily: 'VT323, monospace', fontSize: '18px' });
  const selectStyle = (hasError: boolean) => ({ background: '#000', color: '#FFF', borderColor: hasError ? '#FF5555' : '#AAA', fontFamily: 'VT323, monospace', fontSize: '18px' });

  return (
    <div className="p-4 overflow-auto h-full">
      <div className="border-2" style={{ background: '#0000AA', borderColor: '#FFF', maxWidth: '900px', margin: '0 auto' }}>
        <div className="text-center py-1" style={{ background: '#AAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000' }}>\\u2550\\u2550\\u2550 \\u0420\\u0415\\u0413\\u0418\\u0421\\u0422\\u0420\\u0410\\u0426\\u0418\\u042f \\u041f\\u0420\\u0418\\u0411\\u041e\\u0420\\u0410 \\u0423\\u0427\\u0401\\u0422\\u0410 \\u2550\\u2550\\u2550</span>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>1. \\u041a\\u043e\\u0434 \\u0440\\u0435\\u0433\\u0438\\u043e\\u043d\\u0430:</label>
              <select value={regionCode} onChange={e => setRegionCode(e.target.value as RegionCode)} className="w-full px-2 py-1 border-2 mt-1" style={selectStyle(false)}>
                {user.regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>2. \\u041d\\u043e\\u043c\\u0435\\u0440 \\u0411\\u0421:</label>
              <input type="text" value={bsNumber} onChange={e => setBsNumber(e.target.value.toUpperCase())} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.bsNumber)} placeholder={regionCode + ' + 6 \\u0446\\u0438\\u0444\\u0440'} />
              {errors.bsNumber && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.bsNumber}</span>}
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>3. \\u0422\\u0438\\u043f \\u0434\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u044f:</label>
              <select value={actionType} onChange={e => setActionType(e.target.value as ActionType)} className="w-full px-2 py-1 border-2 mt-1" style={selectStyle(false)}>
                <option value="\\u0420\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0430\\u0446\\u0438\\u044f">\\u0420\\u0435\\u0433\\u0438\\u0441\\u0442\\u0440\\u0430\\u0446\\u0438\\u044f</option>
                <option value="\\u0420\\u0435\\u0434\\u0430\\u043a\\u0442\\u0438\\u0440\\u043e\\u0432\\u0430\\u043d\\u0438\\u0435">\\u0420\\u0435\\u0434\\u0430\\u043a\\u0442\\u0438\\u0440\\u043e\\u0432\\u0430\\u043d\\u0438\\u0435</option>
                <option value="\\u0423\\u0434\\u0430\\u043b\\u0435\\u043d\\u0438\\u0435">\\u0423\\u0434\\u0430\\u043b\\u0435\\u043d\\u0438\\u0435</option>
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>4. \\u0422\\u0438\\u043f \\u043f\\u0440\\u0438\\u0431\\u043e\\u0440\\u0430:</label>
              <select value={meterType} onChange={e => setMeterType(e.target.value as MeterType)} className="w-full px-2 py-1 border-2 mt-1" style={selectStyle(false)}>
                {METER_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>5. \\u041d\\u043e\\u043c\\u0435\\u0440 \\u0441\\u0447\\u0451\\u0442\\u0447\\u0438\\u043a\\u0430{cursorVisible ? '\\u2588' : ''}:</label>
              <input type="text" value={meterNumber} onChange={e => setMeterNumber(e.target.value.replace(/[^0-9]/g, '').substring(0, 16))} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.meterNumber)} placeholder="\\u0434\\u043e 16 \\u0446\\u0438\\u0444\\u0440" />
              {errors.meterNumber && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.meterNumber}</span>}
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>6. \\u0422\\u0438\\u043f \\u043c\\u043e\\u0434\\u0435\\u043c\\u0430:</label>
              <select value={modemMode} onChange={e => setModemMode(e.target.value as any)} className="w-full px-2 py-1 border-2 mt-1" style={selectStyle(!!errors.modemType)}>
                <option value="\\u0432\\u0441\\u0442\\u0440\\u043e\\u0435\\u043d\\u043d\\u044b\\u0439">\\u0432\\u0441\\u0442\\u0440\\u043e\\u0435\\u043d\\u043d\\u044b\\u0439</option>
                <option value="custom">\\u0423\\u043a\\u0430\\u0437\\u0430\\u0442\\u044c \\u043d\\u043e\\u043c\\u0435\\u0440</option>
              </select>
              {modemMode === 'custom' && <input type="text" value={modemNumber} onChange={e => setModemNumber(e.target.value.replace(/[^0-9]/g, '').substring(0, 20))} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.modemType)} placeholder="\\u043d\\u043e\\u043c\\u0435\\u0440 4-20 \\u0446\\u0438\\u0444\\u0440" />}
              {errors.modemType && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.modemType}</span>}
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>7. \\u041d\\u043e\\u043c\\u0435\\u0440 SIM:</label>
              <input type="text" value={simCardNumber} onChange={e => setSimCardNumber(e.target.value)} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.simCardNumber)} placeholder="79001112233" />
              {errors.simCardNumber && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.simCardNumber}</span>}
            </div>
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>8. \\u041e\\u0442\\u043c\\u0435\\u0442\\u043a\\u0430:</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(false)} readOnly />
            </div>
          </div>
          <div className="mt-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>10. \\u0410\\u0434\\u0440\\u0435\\u0441:</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.address)} rows={2} maxLength={1000} />
            {errors.address && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.address}</span>}
          </div>
          <div className="mt-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>11. \\u041f\\u0440\\u0438\\u043c\\u0435\\u0447\\u0430\\u043d\\u0438\\u0435:</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full px-2 py-1 border-2 mt-1" style={inputStyle(!!errors.comment)} rows={2} maxLength={1000} />
            {errors.comment && <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>{errors.comment}</span>}
          </div>
          {success && <div className="mt-4 p-2 border" style={{ background: '#005500', color: '#55FF55', borderColor: '#55FF55', fontFamily: 'VT323, monospace', fontSize: '18px' }}>{success}</div>}
          <div className="flex justify-center mt-6">
            <button type="submit" className="px-6 py-2 border-2 cursor-pointer" style={{ background: '#AAA', color: '#000', borderColor: '#FFF', fontFamily: 'VT323, monospace', fontSize: '20px' }}>[ \\u041e\\u0422\\u041f\\u0420\\u0410\\u0412\\u0418\\u0422\\u042c \\u0417\\u0410\\u042f\\u0412\\u041a\\u0423 ]</button>
          </div>
        </form>
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
console.log('  Компоненты установлены!');
console.log('========================================');
console.log('');
console.log('Теперь выполните:');
console.log('  npm run build');
console.log('  node server.js');
console.log('');
