import { Home } from 'lucide-preact';

export function TopMenu({ currentPage, navigate }) {
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
              <span>Accueil</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
