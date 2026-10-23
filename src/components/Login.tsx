import React, { useState, useEffect, useRef } from 'react';
import { User, USERS } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const loginRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loginRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.login === login && u.password === password);
    if (user) {
      setError('');
      onLogin(user);
    } else {
      setError('▌ ОШИБКА: Неверный логин или пароль!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#0000AA' }}>
      <div className="border-2 border-white p-0" style={{ 
        background: '#0000AA', 
        minWidth: '500px',
        boxShadow: '4px 4px 0px #000'
      }}>
        {/* Title bar */}
        <div className="flex items-center justify-center py-1 px-2" style={{ 
          background: '#AAAAAA',
          color: '#000000'
        }}>
          <span className="font-bold text-sm tracking-wider" style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}>
            ╔══════════════════════════════════════╗
          </span>
        </div>
        <div className="flex items-center justify-center" style={{ 
          background: '#AAAAAA',
          color: '#000000'
        }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}>
            ║&nbsp;&nbsp;&nbsp;ПУ-РЕГИСТРАТОР v1.0 — АВТОРИЗАЦИЯ&nbsp;&nbsp;&nbsp;║
          </span>
        </div>
        <div className="flex items-center justify-center" style={{ 
          background: '#AAAAAA',
          color: '#000000'
        }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}>
            ╚══════════════════════════════════════╝
          </span>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label className="block mb-1" style={{ 
              color: '#FFFF55', 
              fontFamily: 'VT323, monospace', 
              fontSize: '20px' 
            }}>
              Логин пользователя:{cursorVisible && login === '' ? '█' : ''}
            </label>
            <input
              ref={loginRef}
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="w-full px-2 py-1 border-2 outline-none"
              style={{
                background: '#000000',
                color: '#FFFFFF',
                borderColor: '#AAAAAA',
                fontFamily: 'VT323, monospace',
                fontSize: '20px',
              }}
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1" style={{ 
              color: '#FFFF55', 
              fontFamily: 'VT323, monospace', 
              fontSize: '20px' 
            }}>
              Пароль:
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-2 py-1 border-2 outline-none"
              style={{
                background: '#000000',
                color: '#FFFFFF',
                borderColor: '#AAAAAA',
                fontFamily: 'VT323, monospace',
                fontSize: '20px',
              }}
            />
          </div>

          {error && (
            <div className="mb-4 p-2 border" style={{
              background: '#AA0000',
              color: '#FFFFFF',
              borderColor: '#FF5555',
              fontFamily: 'VT323, monospace',
              fontSize: '18px',
            }}>
              {error}
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-6 py-1 border-2 cursor-pointer"
              style={{
                background: '#AAAAAA',
                color: '#000000',
                borderColor: '#FFFFFF',
                fontFamily: 'VT323, monospace',
                fontSize: '20px',
                borderBottom: '2px solid #555555',
                borderRight: '2px solid #555555',
              }}
              onMouseDown={e => {
                const btn = e.currentTarget;
                btn.style.borderTop = '2px solid #555555';
                btn.style.borderLeft = '2px solid #555555';
                btn.style.borderBottom = '2px solid #FFFFFF';
                btn.style.borderRight = '2px solid #FFFFFF';
              }}
              onMouseUp={e => {
                const btn = e.currentTarget;
                btn.style.borderTop = '';
                btn.style.borderLeft = '';
                btn.style.borderBottom = '2px solid #555555';
                btn.style.borderRight = '2px solid #555555';
              }}
            >
              [ ВОЙТИ ]
            </button>
          </div>

          <div className="mt-6 text-center" style={{ 
            color: '#55FFFF', 
            fontFamily: 'VT323, monospace', 
            fontSize: '16px' 
          }}>
            F1-Справка | F10-Выход
          </div>
        </form>
      </div>
    </div>
  );
}
