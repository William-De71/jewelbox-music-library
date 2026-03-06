import { useI18n } from '../config/i18n/index.js';
import { LanguageSelector } from './LanguageSelector.jsx';

export function Layout({ children, navigate, currentPage }) {
  const { t } = useI18n();
  return (
    <div class="wrapper">
      <aside class="navbar navbar-vertical navbar-expand-lg navbar-dark" data-bs-theme="dark">
        <div class="container-fluid">
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar-menu">
            <span class="navbar-toggler-icon"></span>
          </button>
          <h1 class="navbar-brand navbar-brand-autodark">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}>
              <span class="d-flex align-items-center gap-2">
                <i class="ti ti-disc fs-2 text-primary"></i>
                <span>
                  <span class="fw-bold">JewelBox</span>
                  <span class="d-block text-muted small fw-normal brand-subtitle">Music Library</span>
                </span>
              </span>
            </a>
          </h1>
          <div class="collapse navbar-collapse" id="sidebar-menu">
            <ul class="navbar-nav pt-lg-3">
              <li class="nav-item">
                <a
                  class={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate('dashboard'); }}
                >
                  <span class="nav-link-icon d-md-none d-lg-inline-block">
                    <i class="ti ti-home"></i>
                  </span>
                  <span class="nav-link-title">{t('nav.dashboard')}</span>
                </a>
              </li>
              <li class="nav-item">
                <a
                  class={`nav-link ${currentPage === 'add' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate('add'); }}
                >
                  <span class="nav-link-icon d-md-none d-lg-inline-block">
                    <i class="ti ti-disc-plus"></i>
                  </span>
                  <span class="nav-link-title">{t('nav.addAlbum')}</span>
                </a>
              </li>
              <li class="nav-item">
                <a
                  class={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate('settings'); }}
                >
                  <span class="nav-link-icon d-md-none d-lg-inline-block">
                    <i class="ti ti-settings"></i>
                  </span>
                  <span class="nav-link-title">{t('nav.settings')}</span>
                </a>
              </li>
            </ul>
            
            {/* Language selector */}
            <div class="language-selector px-3">
              <LanguageSelector className="w-100" />
            </div>
            
            <div class="mt-auto pb-3">
              <div class="px-3 small text-muted">
                <i class="ti ti-quote me-1"></i>
                <em>{t('dashboard.subtitle')}</em>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div class="page-wrapper">
        {children}
        <footer class="footer footer-transparent d-print-none">
          <div class="container-xl">
            <div class="row text-center align-items-center">
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
    </div>
  );
}
