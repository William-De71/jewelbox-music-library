# Système d'internationalisation (i18n)

## Structure

```
src/config/i18n/
├── index.js      # Hook useI18n + logique
├── fr.json       # Traductions françaises
├── en.json       # Traductions anglaises (à créer)
└── README.md     # Documentation
```

## Utilisation

### Importer le hook

```javascript
import { useI18n } from '../config/i18n/index.js';
```

### Utiliser dans un composant

```jsx
export function MyComponent() {
  const { t, currentLocale, changeLocale } = useI18n();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.subtitle')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Ajouter une nouvelle langue

1. Créer le fichier JSON (ex: `es.json`)
2. Importer dans `index.js`
3. Ajouter à l'objet `translations`

```javascript
// 1. Créer es.json avec les mêmes clés que fr.json
// 2. Importer
import es from './es.json';

// 3. Ajouter
const translations = {
  fr,
  es, // Ajouté ici
};
```

### Structure des traductions

Les clés sont organisées par section :

```json
{
  "nav": {
    "dashboard": "Tableau de bord",
    "addAlbum": "Ajouter un album"
  },
  "dashboard": {
    "title": "JewelBox Music Library",
    "subtitle": "Parce que vos albums méritent mieux qu'une simple étagère."
  },
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler"
  }
}
```

### Accès aux traductions

```jsx
// Simple
{t('dashboard.title')}

// Avec paramètres
{t('pagination.showing', { start: 1, end: 24, total: 100 })}
```

## Persistance

La langue sélectionnée est sauvegardée dans `localStorage` sous la clé `jewelbox-locale`.

## Fallback

Si une clé manque dans la langue actuelle, le système utilise automatiquement le français comme fallback.
