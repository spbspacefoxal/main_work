import { User, Page } from '../types';
import { exportToXlsx } from '../export';

interface LayoutProps {
  user: User;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, currentPage, onNavigate, onLogout, children }: LayoutProps) {
  const menuItems: { key: Page; label: string; adminOnly?: boolean }[] = [
    { key: 'view', label: 'Просмотр ПУ' },
    { key: 'registration', label: 'Регистрация' },
    { key: 'database', label: 'ХБ по ПУ' },
    { key: 'feedback', label: 'Обратная связь' },
    { key: 'help', label: 'Справка' },
    { key: 'about', label: 'О программе' },
  ];

  const handleExport = async () => {
    await exportToXlsx();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#00AAAA' }}>
      {/* Top menu bar */}
      <div className="flex items-center px-1 py-0 flex-shrink-0" style={{ background: '#AAAAAA' }}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className="px-3 py-0 cursor-pointer border-none outline-none"
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: '18px',
              color: '#000000',
              background: currentPage === item.key ? '#FFFF55' : 'transparent',
              fontWeight: currentPage === item.key ? 'bold' : 'normal',
            }}
          >
            {item.label}
          </button>
        ))}
        {user.canExport && (
          <button
            onClick={handleExport}
            className="px-3 py-0 cursor-pointer border-none outline-none"
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: '18px',
              color: '#000000',
              background: 'transparent',
            }}
          >
            Выгрузка
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={onLogout}
          className="px-3 py-0 cursor-pointer border-none outline-none"
          style={{
            fontFamily: 'VT323, monospace',
            fontSize: '18px',
            color: '#000000',
            background: 'transparent',
          }}
        >
          Выход
        </button>
      </div>

      {/* User info bar */}
      <div className="flex items-center px-2 py-0 flex-shrink-0" style={{ background: '#0000AA' }}>
        <span style={{
          fontFamily: 'VT323, monospace',
          fontSize: '16px',
          color: '#FFFFFF'
        }}>
          Пользователь: <span style={{ color: '#FFFF55' }}>{user.login}</span>
          {' │ '}
          Роль: <span style={{ color: '#55FFFF' }}>
            {user.role === 'root' ? 'ROOT' : user.role === 'admin' ? 'АДМИНИСТРАТОР' : 'ПОЛЬЗОВАТЕЛЬ'}
          </span>
          {' │ '}
          Регионы: <span style={{ color: '#55FF55' }}>{user.regions.join(', ')}</span>
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center px-2 py-0 flex-shrink-0" style={{ background: '#AAAAAA' }}>
        <span style={{
          fontFamily: 'VT323, monospace',
          fontSize: '16px',
          color: '#000000'
        }}>
          F1-Справка │ F2-Регистрация │ F3-Просмотр ПУ │ F10-Выход
        </span>
        <div className="flex-1" />
        <span style={{
          fontFamily: 'VT323, monospace',
          fontSize: '16px',
          color: '#000000'
        }}>
          ПУ-Регистратор v1.0
        </span>
      </div>
    </div>
  );
}
