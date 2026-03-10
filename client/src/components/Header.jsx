import { useI18n } from '../config/i18n/index.js';
import { Sun, Moon } from 'lucide-preact';

export function Header({ onThemeToggle, isDark }) {
  const { t } = useI18n();
  
  return (
    <header class="header-top">
      <div class="header-container">
        <div class="d-flex align-items-center justify-content-between py-3">
          <div class="header-brand">
            <div class="d-flex align-items-center gap-2">
              <i class="ti ti-disc fs-1 text-primary"></i>
              <div>
                <h1 class="header-title mb-0">JewelBox</h1>
                <p class="header-subtitle mb-0 text-muted small">{t('dashboard.subtitle')}</p>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button 
              class="theme-toggle" 
              onClick={onThemeToggle}
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
