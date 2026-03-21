import { Home } from 'lucide-preact';
import { useI18n } from '../config/i18n/index.js';
import '../styles/topmenu.css';

export function TopMenu({ currentPage, navigate }) {
  const { t } = useI18n();
  
  return (
    <nav class="navbar navbar-expand">
      <div class="container">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a 
              class={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}
            >
              <Home size={20} class="me-2" />
              {t('common.home')}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
