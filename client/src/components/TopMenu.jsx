import { Home, Disc, Heart, ArrowRightLeft, BarChart3, Settings, Info } from 'lucide-preact';
import { useI18n } from '../config/i18n/index.jsx';
import '../styles/topmenu.css';

export function TopMenu({ currentPage, navigate }) {
  const { t } = useI18n();
  
  return (
    <nav class="navbar navbar-expand">
      <div class="container">
        <ul class="navbar-nav me-auto">
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
          <li class="nav-item">
            <a 
              class={`nav-link ${currentPage === 'collections' ? 'active' : ''}`}
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('collections'); }}
            >
              <Disc size={20} class="me-2" />
              {t('menu.collections')}
            </a>
          </li>
          <li class="nav-item">
            <a 
              class={`nav-link ${currentPage === 'wantlist' ? 'active' : ''}`}
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('wantlist'); }}
            >
              <Heart size={20} class="me-2" />
              {t('menu.wantlist')}
            </a>
          </li>
          <li class="nav-item">
            <a 
              class={`nav-link ${currentPage === 'lend' ? 'active' : ''}`}
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('lend'); }}
            >
              <ArrowRightLeft size={20} class="me-2" />
              {t('menu.lend')}
            </a>
          </li>
          <li class="nav-item">
            <a 
              class={`nav-link ${currentPage === 'stats' ? 'active' : ''}`}
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('stats'); }}
            >
              <BarChart3 size={20} class="me-2" />
              {t('menu.stats')}
            </a>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a 
              class={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('settings'); }}
            >
              <Settings size={20} class="me-2" />
              {t('menu.settings')}
            </a>
          </li>
          <li class="nav-item">
            <a 
              class={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('about'); }}
            >
              <Info size={20} class="me-2" />
              À propos
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
