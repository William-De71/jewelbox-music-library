import { Globe } from 'lucide-preact';
import { useI18n } from '../config/i18n/index.jsx';

export function LanguageSelector({ className = '' }) {
  const { currentLocale, changeLocale, availableLocales } = useI18n();

  return (
    <div class={`dropdown ${className}`}>
      <button 
        class="btn btn-outline-light btn-sm dropdown-toggle" 
        type="button" 
        data-bs-toggle="dropdown"
      >
        <Globe size={14} class="me-1" />
        {currentLocale === 'fr' ? 'Français' : 'English'}
      </button>
      <ul class="dropdown-menu">
        {availableLocales.map((locale) => (
          <li key={locale}>
            <a
              class={`dropdown-item ${currentLocale === locale ? 'active' : ''}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                changeLocale(locale);
              }}
            >
              {locale === 'fr' ? 'Français' : 'English'}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
