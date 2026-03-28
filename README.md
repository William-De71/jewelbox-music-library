# 💿 JewelBox Music Library

> *Parce que vos albums méritent mieux qu'une simple étagère.*

Application web progressive (PWA) de gestion de collection de CDs physiques, construite avec **Preact**, **Fastify** et **SQLite**.

---

## ✨ Fonctionnalités

- **Gestion complète** : Ajouter, modifier, supprimer des albums
- **Multiples bases de données** : Gérez plusieurs collections séparées (famille, bureau…)
- **Liste de souhaits** : Suivez les albums que vous souhaitez acquérir
- **Prêt de CD** : Marquer un album comme prêté et noter à qui
- **Vue Grille / Liste** : Basculez entre les deux modes d'affichage
- **Filtres & Tri** : Par genre, note, titre, artiste, année
- **Recherche** : Recherche sur titre et artiste
- **Recherche externe (MusicBrainz & Discogs)** : Pré-remplissage automatique via titre, artiste ou EAN/code-barres
- **Gestion des pistes** : Titre + durée par piste
- **Pochettes** : Upload local ou URL distante, téléchargement automatique depuis CoverArtArchive
- **Statistiques** : Vue d'ensemble de votre collection
- **Internationalisation** : Interface en français
- **PWA** : Installable sur mobile et desktop

---

## 🗂️ Structure du projet

```text
JewelBox-Music-Library/
├── client/                        # Frontend Preact
│   ├── public/
│   │   ├── favicon.svg            # Icône de l'application
│   │   ├── manifest.webmanifest   # Manifest PWA
│   │   └── icons/                 # Icônes PWA
│   ├── src/
│   │   ├── api/                   # Fonctions d'appel à l'API REST
│   │   ├── components/            # Composants réutilisables
│   │   ├── config/i18n/           # Traductions (fr.json)
│   │   ├── pages/                 # Pages de l'application
│   │   │   ├── Dashboard.jsx      # Tableau de bord (page d'accueil)
│   │   │   ├── Collections.jsx    # Collection (albums possédés)
│   │   │   ├── WantList.jsx       # Liste de souhaits
│   │   │   ├── AlbumForm.jsx      # Formulaire ajout/modification
│   │   │   ├── AlbumDetail.jsx    # Détail d'un album
│   │   │   ├── Stats.jsx          # Statistiques
│   │   │   └── Settings.jsx       # Paramètres et bases de données
│   │   ├── styles/                # Fichiers CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                        # Backend Fastify
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.js          # Schéma SQLite
│   │   │   ├── database.js        # Connexion + migrations automatiques
│   │   │   ├── manager.js         # Gestion multi-bases
│   │   │   └── queries.js         # Requêtes SQL
│   │   ├── routes/
│   │   │   ├── albums.js          # CRUD albums + prêt
│   │   │   ├── search.js          # Recherche MusicBrainz / Discogs
│   │   │   ├── database.js        # Gestion des bases de données
│   │   │   └── uploads.js         # Upload de pochettes
│   │   └── index.js               # Point d'entrée Fastify
│   ├── data/                      # Bases SQLite + pochettes (ignoré par git)
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json                   # Workspaces npm
└── README.md
```

---

## 🗄️ Schéma de la base de données

```sql
artists  (id, name UNIQUE, created_at)
labels   (id, name UNIQUE, created_at)
albums   (id, title, artist_id → artists, label_id → labels,
          year, genre, total_duration, ean UNIQUE,
          rating 1-5, cover_url, notes,
          is_lent, lent_to,
          is_wanted,
          created_at, updated_at)
tracks   (id, album_id → albums CASCADE, position, title, duration)
```

> Les migrations sont appliquées automatiquement à l'ouverture d'une base existante.

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- npm 9+

### Installation

```bash
git clone https://github.com/ton-user/jewelbox-music-library.git
cd JewelBox-Music-Library
npm install
```

### Configuration

```bash
cp server/.env.example server/.env
```

### Lancement en développement

```bash
# Depuis la racine (démarre serveur + client simultanément)
npm run dev

# Séparément :
cd server && node src/index.js          # http://localhost:3001
cd client && node ../node_modules/vite/bin/vite.js   # http://localhost:5173
```

---

## 🧪 Tests

```bash
# Tests du serveur (Vitest)
cd server && node ../node_modules/vitest/vitest.mjs run
```

---

## 🌐 API REST

| Méthode  | Endpoint                     | Description                              |
|----------|------------------------------|------------------------------------------|
| `GET`    | `/api/albums`                | Liste paginée (filtres, tri, recherche)  |
| `GET`    | `/api/albums/:id`            | Détail + pistes                          |
| `POST`   | `/api/albums`                | Créer un album                           |
| `PATCH`  | `/api/albums/:id`            | Modifier un album                        |
| `DELETE` | `/api/albums/:id`            | Supprimer un album                       |
| `PATCH`  | `/api/albums/:id/lend`       | Prêter / récupérer                       |
| `GET`    | `/api/albums/genres`         | Liste des genres                         |
| `GET`    | `/api/search?q=`             | Recherche MusicBrainz par titre/artiste  |
| `GET`    | `/api/search?ean=`           | Recherche par EAN/code-barres            |
| `GET`    | `/api/search/:mbid`          | Détail complet d'une release             |
| `POST`   | `/api/upload/cover`          | Upload d'une pochette                    |
| `GET`    | `/api/database`              | Liste des bases de données               |
| `POST`   | `/api/database`              | Créer une nouvelle base                  |
| `POST`   | `/api/database/:id/activate` | Activer une base                         |
| `GET`    | `/api/database/active`       | Base de données active                   |

### Paramètres de `GET /api/albums`

| Paramètre | Type    | Description                             |
|-----------|---------|-----------------------------------------|
| `page`    | entier  | Numéro de page (défaut : 1)             |
| `limit`   | entier  | Albums par page (défaut : 24, max : 100)|
| `genre`   | texte   | Filtrer par genre                       |
| `rating`  | entier  | Filtrer par note (1-5)                  |
| `sort`    | texte   | `title`, `artist`, `year`, `rating`     |
| `order`   | texte   | `asc` ou `desc`                         |
| `search`  | texte   | Recherche sur titre et artiste          |
| `wanted`  | booléen | `true` = liste de souhaits uniquement   |
| `lent`    | booléen | `true` = albums prêtés uniquement       |

---
