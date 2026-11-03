import React, { useState } from 'react';

export default function Feedback() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="p-4">
      <div className="border-2" style={{ 
        background: '#0000AA', 
        borderColor: '#FFFFFF',
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        <div className="text-center py-1" style={{ background: '#AAAAAA' }}>
          <span style={{ fontFamily: 'VT323, monospace', fontSize: '20px', color: '#000000' }}>
            ═══ ОБРАТНАЯ СВЯЗЬ ═══
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
              Ваше имя:
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-2 py-1 border-2 mt-1"
              style={{
                background: '#000000',
                color: '#FFFFFF',
                borderColor: '#AAAAAA',
                fontFamily: 'VT323, monospace',
                fontSize: '18px',
              }}
              required
            />
          </div>

          <div className="mb-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-2 py-1 border-2 mt-1"
              style={{
                background: '#000000',
                color: '#FFFFFF',
                borderColor: '#AAAAAA',
                fontFamily: 'VT323, monospace',
                fontSize: '18px',
              }}
              required
            />
          </div>

          <div className="mb-4">
            <label style={{ fontFamily: 'VT323, monospace', fontSize: '18px', color: '#FFFF55' }}>
              Сообщение:
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-2 py-1 border-2 mt-1"
              style={{
                background: '#000000',
                color: '#FFFFFF',
                borderColor: '#AAAAAA',
                fontFamily: 'VT323, monospace',
                fontSize: '18px',
              }}
              rows={5}
              required
            />
          </div>

          {sent && (
            <div className="mb-4 p-2 border" style={{
              background: '#005500',
              color: '#55FF55',
              borderColor: '#55FF55',
              fontFamily: 'VT323, monospace',
              fontSize: '18px',
            }}>
              ✓ Сообщение отправлено! Мы свяжемся с вами в ближайшее время.
            </div>
          )}

          <div className="flex justify-center">
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
              [ ОТПРАВИТЬ ]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
