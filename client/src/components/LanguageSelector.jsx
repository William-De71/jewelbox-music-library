import { useI18n } from '../config/i18n/index.js';

export function LanguageSelector({ className = '' }) {
  const { currentLocale, changeLocale, availableLocales } = useI18n();

  return (
    <div class={`dropdown ${className}`}>
      <button 
        class="btn btn-outline-light btn-sm dropdown-toggle" 
        type="button" 
        data-bs-toggle="dropdown"
      >
        <i class="ti ti-language me-1"></i>
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
