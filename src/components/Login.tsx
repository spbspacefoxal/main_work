import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { login } from '../db';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const loginRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loginRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(loginValue, password);

    if (result.success && result.user) {
      onLogin(result.user as User);
    } else {
      setError('▌ ОШИБКА: ' + (result.error || 'Неверный логин или пароль!'));
    }

    setLoading(false);
  };

  const inputStyle = { background: '#000000', color: '#FFFFFF', borderColor: '#AAAAAA', fontFamily: 'VT323, monospace', fontSize: '20px' };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0000AA' }}>
      <div className="border-2 border-white p-0" style={{ background: '#0000AA', minWidth: '500px', boxShadow: '4px 4px 0px #000' }}>
        <div className="text-center py-1" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#000' }}>
            ╔{'═'.repeat(38)}╗
          </span>
        </div>
        <div className="text-center" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#000' }}>
            ║&nbsp;&nbsp;&nbsp;ПУ-РЕГИСТРАТОР 2.0 — АВТОРИЗАЦИЯ&nbsp;&nbsp;&nbsp;║
          </span>
        </div>
        <div className="text-center" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#000' }}>
            ╚{'═'.repeat(38)}╝
          </span>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label style={{ color: '#FFFF55', fontFamily: 'VT323, monospace', fontSize: '20px' }}>
              Логин:{cursorVisible && loginValue === '' ? '█' : ''}
            </label>
            <input
              ref={loginRef}
              type="text"
              value={loginValue}
              onChange={e => setLoginValue(e.target.value)}
              className="w-full px-2 py-1 border-2 outline-none mt-1"
              style={inputStyle}
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label style={{ color: '#FFFF55', fontFamily: 'VT323, monospace', fontSize: '20px' }}>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-2 py-1 border-2 outline-none mt-1"
              style={inputStyle}
              disabled={loading}
            />
          </div>
          {error && (
            <div className="mb-4 p-2 border" style={{ background: '#AA0000', color: '#FFF', borderColor: '#FF5555', fontFamily: 'VT323, monospace', fontSize: '18px' }}>
              {error}
            </div>
          )}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-6 py-1 border-2 cursor-pointer"
              style={{ background: '#AAAAAA', color: '#000', borderColor: '#FFF', fontFamily: 'VT323, monospace', fontSize: '20px' }}
              disabled={loading}
            >
              {loading ? '[ ЗАГРУЗКА... ]' : '[ ВОЙТИ ]'}
            </button>
          </div>
          <div className="mt-4 text-center" style={{ color: '#55FFFF', fontFamily: 'VT323, monospace', fontSize: '14px' }}>
            Nginx + PHP-FPM + PostgreSQL + Redis
          </div>
        </form>
      </div>
    </div>
  );
}
