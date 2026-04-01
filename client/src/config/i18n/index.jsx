import { createContext } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';

// Import translations
import fr from './fr.json';
// import en from './en.json'; 

// Available locales
const translations = {
  fr,
  // en,
};

// Default locale
const DEFAULT_LOCALE = 'fr';

// Create the context
const I18nContext = createContext(null);

// Context provider
export function I18nProvider({ children }) {
  const [currentLocale, setCurrentLocale] = useState(() => {
    const saved = localStorage.getItem('jewelbox-locale');
    return (saved && translations[saved]) ? saved : DEFAULT_LOCALE;
  });

  // Change locale
  const changeLocale = (newLocale) => {
    if (translations[newLocale]) {
      setCurrentLocale(newLocale);
      localStorage.setItem('jewelbox-locale', newLocale);
    }
  };

  // Translation function
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[currentLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fall back to French if the key does not exist
        value = translations.fr;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return the key if nothing found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace {param} placeholders in the string
    return value.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
  };

  const value = { 
    t, 
    currentLocale, 
    changeLocale, 
    availableLocales: Object.keys(translations) 
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Hook to consume the i18n context
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export { translations };
