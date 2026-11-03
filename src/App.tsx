import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Page } from './types';
import { checkAuth, logout as apiLogout } from './db';
import Login from './components/Login';
import Layout from './components/Layout';
import ViewMeters from './components/ViewMeters';
import Registration from './components/Registration';
import Database from './components/Database';
import Feedback from './components/Feedback';
import Help from './components/Help';
import About from './components/About';

const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 минут

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('view');
  const [loading, setLoading] = useState(true);
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkSession = async () => {
      const result = await checkAuth();
      if (result.authenticated && result.user) {
        setUser(result.user as User);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const clearTimer = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    sessionTimerRef.current = setTimeout(async () => {
      await apiLogout();
      setUser(null);
      setCurrentPage('view');
    }, SESSION_TIMEOUT);
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (!user) { clearTimer(); return; }
    const handleActivity = () => { resetTimer(); };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    startTimer();
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearTimer();
    };
  }, [user, startTimer, resetTimer, clearTimer]);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setCurrentPage('view');
  };

  const handleLogout = async () => {
    await apiLogout();
    setUser(null);
    setCurrentPage('view');
    clearTimer();
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    resetTimer();
  };

  // Экран загрузки
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0000AA' }}>
        <span style={{ fontFamily: 'VT323, monospace', fontSize: '24px', color: '#FFFF55' }}>
          Загрузка...█
        </span>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'view': return <ViewMeters user={user} />;
      case 'registration': return <Registration user={user} />;
      case 'database': return <Database user={user} />;
      case 'feedback': return <Feedback />;
      case 'help': return <Help />;
      case 'about': return <About />;
      default: return <ViewMeters user={user} />;
    }
  };

  return (
    <Layout user={user} currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}
