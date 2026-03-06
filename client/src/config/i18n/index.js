import { createContext } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';

// Import des traductions
import fr from './fr.json';
// import en from './en.json'; 

// Langues disponibles
const translations = {
  fr,
  // en,
};

// Langue par défaut
const DEFAULT_LOCALE = 'fr';

// Créer le contexte
const I18nContext = createContext(null);

// Provider pour le contexte
export function I18nProvider({ children }) {
  const [currentLocale, setCurrentLocale] = useState(() => {
    const saved = localStorage.getItem('jewelbox-locale');
    return (saved && translations[saved]) ? saved : DEFAULT_LOCALE;
  });

  // Changer de langue
  const changeLocale = (newLocale) => {
    if (translations[newLocale]) {
      setCurrentLocale(newLocale);
      localStorage.setItem('jewelbox-locale', newLocale);
    }
  };

  // Fonction de traduction
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[currentLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback vers le français si la clé n'existe pas
        value = translations.fr;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Retourner la clé si rien trouvé
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Remplacer les paramètres {param} dans la chaîne
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

// Hook pour utiliser le contexte
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export { translations };
