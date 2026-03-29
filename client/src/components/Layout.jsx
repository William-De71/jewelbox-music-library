import { useState, useEffect } from 'preact/hooks';
import { useI18n } from '../config/i18n/index.js';
import { Header } from './Header.jsx';
import { TopMenu } from './TopMenu.jsx';

export function Layout({ children, navigate, currentPage }) {
  const { t } = useI18n();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('jewelbox-theme');
    if (saved === null) {
      return true; // Default to dark
    }
    return saved === 'dark';
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('jewelbox-theme', theme);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div class="layout-horizontal">
      <Header onThemeToggle={toggleTheme} isDark={isDark} />
      <TopMenu currentPage={currentPage} navigate={navigate} />
      <main class="main-content">
        {children}
      </main>
    </div>
  );
}
