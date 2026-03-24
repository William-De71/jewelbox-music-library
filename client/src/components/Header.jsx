import { useI18n } from '../config/i18n/index.js';
import { Sun, Moon, Disc } from 'lucide-preact';

export function Header({ onThemeToggle, isDark }) {
  const { t } = useI18n();
  
  return (
    <header class="header-top">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between py-3">
          <div class="header-brand">
            <div class="d-flex align-items-center gap-2">
              <Disc size={32} class="text-primary" />
              <div>
                <h1 class="header-title mb-0">{t('common.title')}</h1>
                <p class="header-subtitle mb-0 text-muted small"><em>{t('common.subtitle')}</em></p>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button 
              class="theme-toggle" 
              onClick={onThemeToggle}
              title={isDark ? t('common.lightMode') : t('common.darkMode')}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
