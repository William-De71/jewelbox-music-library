import { Home } from 'lucide-preact';
import { useI18n } from '../config/i18n/index.js';

export function TopMenu({ currentPage, navigate }) {
  const { t } = useI18n();
  
  return (
    <nav class="top-menu">
      <div class="header-container">
        <ul class="menu-list">
          <li class="menu-item">
            <a 
              class={`menu-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}
            >
              <Home size={24} />
              <span>{t('common.home')}</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
