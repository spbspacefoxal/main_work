import React, { useState, useEffect, useRef } from 'react';
import { User, RegionCode, ActionType, MeterType, ALL_REGIONS, METER_TYPES, MeterRecord } from '../types';
import { addRecord, checkMeterNumberExists, checkModemExists, checkSimCardExists, generateId } from '../db';

interface RegistrationProps {
  user: User;
}

export default function Registration({ user }: RegistrationProps) {
  const [regionCode, setRegionCode] = useState<RegionCode>(user.regions[0]);
  const [bsNumber, setBsNumber] = useState('');
  const [actionType, setActionType] = useState<ActionType>('Регистрация');
  const [meterType, setMeterType] = useState<MeterType>(METER_TYPES[0]);
  const [meterNumber, setMeterNumber] = useState('');
  const [modemType, setModemType] = useState('');
  const [simCardNumber, setSimCardNumber] = useState('');
  const [note, setNote] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setBsNumber(regionCode);
  }, [regionCode]);

  const normalizeSimCard = (value: string): string => {
    let v = value.replace(/[^0-9+]/g, '');
    if (v.startsWith('+')) v = v.substring(1);
    if (v.startsWith('8') && v.length >= 11) v = '7' + v.substring(1);
    return v;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // BS Number validation
    if (!bsNumber.startsWith(regionCode)) {
      newErrors.bsNumber = 'Номер БС должен начинаться с кода региона';
    } else if (bsNumber.length !== regionCode.length + 6) {
      newErrors.bsNumber = 'Номер БС = код региона + 6 цифр';
    } else {
      const digits = bsNumber.substring(regionCode.length);
      if (!/^\d{6}$/.test(digits)) {
        newErrors.bsNumber = 'После кода региона должно быть 6 цифр';
      }
    }

    // Meter number validation
    if (!meterNumber || meterNumber.length === 0) {
      newErrors.meterNumber = 'Введите номер счётчика';
    } else if (!/^\d{1,16}$/.test(meterNumber)) {
      newErrors.meterNumber = 'Номер счётчика: до 16 цифр';
    } else if (checkMeterNumberExists(meterNumber)) {
      newErrors.meterNumber = 'Номер счётчика уже есть в базе!';
    }

    // Modem validation
    if (!modemType) {
      newErrors.modemType = 'Укажите тип модема';
    } else if (modemType !== 'встроенный') {
      if (!/^\d{4,20}$/.test(modemType)) {
        newErrors.modemType = 'Номер модема: от 4 до 20 цифр';
      } else if (checkModemExists(modemType)) {
        newErrors.modemType = 'Номер модема уже есть в базе!';
      }
    }

    // SIM card validation
    const normalizedSim = normalizeSimCard(simCardNumber);
    if (!normalizedSim) {
      newErrors.simCardNumber = 'Введите номер SIM-карты';
    } else if (!/^7\d{10}$/.test(normalizedSim)) {
      newErrors.simCardNumber = 'Номер SIM: 11 цифр, начиная с 7';
    } else if (checkSimCardExists(normalizedSim)) {
      newErrors.simCardNumber = 'Номер SIM-карты уже есть в базе!';
    }

    // Address validation
    if (!address.trim()) {
      newErrors.address = 'Введите адрес объекта';
    } else if (address.length > 1000) {
      newErrors.address = 'Адрес не более 1000 символов';
    }

    // Comment validation
    if (comment.length > 1000) {
      newErrors.comment = 'Примечание не более 1000 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');

    if (!validate()) return;

    const normalizedSim = normalizeSimCard(simCardNumber);
    const now = new Date();
    const dateStr = now.toLocaleString('ru-RU');

    const record: MeterRecord = {
      id: generateId(),
      regionCode,
      bsNumber,
      actionType,
      meterType,
      meterNumber,
      modemType,
      simCardNumber: normalizedSim,
      note,
      registrationDate: dateStr,
      address,
      comment,
      registeredBy: user.login,
      registrationStatus: '',
      statusDate: '',
      statusAdmin: '',
    };

    addRecord(record);
    setSuccess('✓ Заявка успешно отправлена и сохранена в базе данных!');

    // Reset form
    setBsNumber(regionCode);
    setMeterNumber('');
    setModemType('');
    setSimCardNumber('');
    setNote('');
    setAddress('');
    setComment('');
    setErrors({});

    setTimeout(() => setSuccess(''), 5000);
  };

  const inputStyle = (hasError: boolean) => ({
    background: '#000000',
    color: '#FFFFFF',
    borderColor: hasError ? '#FF5555' : '#AAAAAA',
    fontFamily: 'VT323, monospace' as const,
    fontSize: '18px',
  });

  const selectStyle = (hasError: boolean) => ({
    background: '#000000',
    color: '#FFFFFF',
    borderColor: hasError ? '#FF5555' : '#AAAAAA',
    fontFamily: 'VT323, monospace' as const,
    fontSize: '18px',
  });

  return (
    <div className="p-4" ref={formRef}>
      <div className="border-2" style={{ 
        background: '#0000AA', 
        borderColor: '#FFFFFF',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Title */}
        <div className="text-center py-1" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000000' }}>
            ═══ РЕГИСТРАЦИЯ ПРИБОРА УЧЁТА ═══
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Region Code */}
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
                1. Код региона:
              </label>
              <select
                value={regionCode}
                onChange={e => setRegionCode(e.target.value as RegionCode)}
                className="w-full px-2 py-1 border-2 mt-1"
                style={selectStyle(false)}
              >
                {user.regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* BS Number */}
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
                2. Номер БС:
              </label>
              <input
                type="text"
                value={bsNumber}
                onChange={e => setBsNumber(e.target.value.toUpperCase())}
                className="w-full px-2 py-1 border-2 mt-1"
                style={inputStyle(!!errors.bsNumber)}
                placeholder={`${regionCode} + 6 цифр`}
              />
              {errors.bsNumber && (
                <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>
                  {errors.bsNumber}
                </span>
              )}
            </div>

            {/* Action Type */}
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
                3. Тип действия:
              </label>
              <select
                value={actionType}
                onChange={e => setActionType(e.target.value as ActionType)}
                className="w-full px-2 py-1 border-2 mt-1"
                style={selectStyle(false)}
              >
                <option value="Регистрация">Регистрация</option>
                <option value="Редактирование">Редактирование</option>
                <option value="Удаление">Удаление</option>
              </select>
            </div>

            {/* Meter Type */}
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
                4. Тип прибора учёта:
              </label>
              <select
                value={meterType}
                onChange={e => setMeterType(e.target.value as MeterType)}
                className="w-full px-2 py-1 border-2 mt-1"
                style={selectStyle(false)}
              >
                {METER_TYPES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Meter Number */}
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
                5. Номер счётчика{cursorVisible ? '█' : ''}:
              </label>
              <input
                type="text"
                value={meterNumber}
                onChange={e => setMeterNumber(e.target.value.replace(/[^0-9]/g, '').substring(0, 16))}
                className="w-full px-2 py-1 border-2 mt-1"
                style={inputStyle(!!errors.meterNumber)}
                placeholder="до 16 цифр"
              />
              {errors.meterNumber && (
                <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>
                  {errors.meterNumber}
                </span>
              )}
            </div>

            {/* Modem Type */}
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
                6. Тип модема:
              </label>
              <input
                type="text"
                value={modemType}
                onChange={e => setModemType(e.target.value)}
                className="w-full px-2 py-1 border-2 mt-1"
                style={inputStyle(!!errors.modemType)}
                placeholder="«встроенный» или номер 4-20 цифр"
              />
              {errors.modemType && (
                <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>
                  {errors.modemType}
                </span>
              )}
            </div>

            {/* SIM Card */}
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
                7. Номер SIM-карты:
              </label>
              <input
                type="text"
                value={simCardNumber}
                onChange={e => setSimCardNumber(e.target.value)}
                className="w-full px-2 py-1 border-2 mt-1"
                style={inputStyle(!!errors.simCardNumber)}
                placeholder="введите номер SIM-карты в виде: 79001112233"
              />
              {errors.simCardNumber && (
                <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>
                  {errors.simCardNumber}
                </span>
              )}
            </div>

            {/* Note */}
            <div>
              <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
                8. Отметка:
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-2 py-1 border-2 mt-1"
                style={inputStyle(false)}
                placeholder="Пусто"
                readOnly
              />
            </div>
          </div>

          {/* Address */}
          <div className="mt-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
              10. Адрес объекта:
            </label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-2 py-1 border-2 mt-1"
              style={inputStyle(!!errors.address)}
              placeholder="до 1000 символов"
              rows={2}
              maxLength={1000}
            />
            {errors.address && (
              <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>
                {errors.address}
              </span>
            )}
          </div>

          {/* Comment */}
          <div className="mt-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
              11. Примечание:
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full px-2 py-1 border-2 mt-1"
              style={inputStyle(!!errors.comment)}
              placeholder="до 1000 символов"
              rows={2}
              maxLength={1000}
            />
            {errors.comment && (
              <span style={{ fontFamily: 'VT323, monospace', fontSize: '14px', color: '#FF5555' }}>
                {errors.comment}
              </span>
            )}
          </div>

          {/* Success message */}
          {success && (
            <div className="mt-4 p-2 border" style={{
              background: '#005500',
              color: '#55FF55',
              borderColor: '#55FF55',
              fontFamily: 'VT323, monospace',
              fontSize: '18px',
            }}>
              {success}
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-6 py-2 border-2 cursor-pointer"
              style={{
                background: '#AAAAAA',
                color: '#000000',
                borderColor: '#FFFFFF',
                fontFamily: 'VT323, monospace',
                fontSize: '20px',
                borderBottom: '2px solid #555555',
                borderRight: '2px solid #555555',
              }}
            >
              [ ОТПРАВИТЬ ЗАЯВКУ НА РЕГИСТРАЦИЮ ]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
