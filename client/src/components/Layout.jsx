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
    console.log('Setting theme to:', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('jewelbox-theme', theme);
  }, [isDark]);

  const toggleTheme = () => {
    console.log('Toggle theme clicked, current isDark:', isDark);
    setIsDark(!isDark);
  };

  return (
    <div class="layout-horizontal">
      <Header onThemeToggle={toggleTheme} isDark={isDark} />
      <TopMenu currentPage={currentPage} navigate={navigate} />
      <main class="main-content">
        {children}
      </main>
      <footer class="footer footer-transparent d-print-none">
        <div class="container-fluid">
          <div class="row text-center align-items-center py-3">
            <div class="col-12 col-lg-6 mt-3 mt-lg-0 text-muted small">
              <i class="ti ti-quote me-1"></i>
              <em>{t('dashboard.subtitle')}</em>
            </div>
            <div class="col-12 col-lg-6 mt-3 mt-lg-0 text-muted small">
              JewelBox Music Library &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
