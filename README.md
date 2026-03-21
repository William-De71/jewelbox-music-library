# 💿 JewelBox Music Library

> *Parce que vos albums méritent mieux qu'une simple étagère.*

A Progressive Web App (PWA) for managing your physical CD collection, built with **Preact**, **Fastify**, and **SQLite**.

---

## ✨ Features

- **CRUD complet** : Ajouter, modifier, supprimer des albums
- **Prêt de CD** : Marquer un album comme prêté et noter à qui
- **Vue Grille / Liste** : Basculez entre les deux modes d'affichage
- **Filtres & Tri** : Par genre, note, titre, artiste, année
- **Recherche** : Recherche full-text sur titre et artiste
- **Recherche externe (MusicBrainz)** : Pré-remplissage automatique via titre, artiste ou EAN/code-barres
- **Gestion des pistes** : Titre + durée par piste
- **Upload de pochette** : Upload local ou URL distante
- **PWA** : Installable sur mobile/desktop, fonctionne hors-ligne

---

## 🗂️ Structure du projet

```bash
JewelBox-Music-Library/
├── client/                  # Frontend Preact
│   ├── public/
│   │   ├── manifest.webmanifest
│   │   └── icons/           # PWA icons (à fournir)
│   ├── src/
│   │   ├── api/client.js    # Client API REST
│   │   ├── components/      # StarRating, CoverImage, AlbumCard, AlbumRow, Pagination, Layout
│   │   ├── pages/           # Dashboard, AlbumForm, AlbumDetail
│   │   ├── store/           # useLibrary hook
│   │   ├── tests/           # Tests Vitest + Testing Library
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                  # Backend Fastify
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.js    # Schéma SQLite
│   │   │   ├── database.js  # Connexion Better-SQLite3
│   │   │   └── queries.js   # Toutes les requêtes SQL
│   │   ├── routes/
│   │   │   ├── albums.js    # CRUD albums + prêt
│   │   │   ├── search.js    # Recherche MusicBrainz
│   │   │   └── meta.js      # Artistes, labels
│   │   ├── tests/
│   │   │   └── queries.test.js
│   │   └── index.js         # Point d'entrée Fastify
│   ├── .env.example
│   └── package.json
├── data/                    # Créé automatiquement (DB + uploads)
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Schéma de la base de données

```sql
artists    (id, name UNIQUE, created_at)
labels     (id, name UNIQUE, created_at)
albums     (id, title, artist_id→artists, label_id→labels,
            year, genre, total_duration, ean UNIQUE,
            rating 1-5, cover_url, notes, is_lent, lent_to,
            created_at, updated_at)
tracks     (id, album_id→albums CASCADE, position, title, duration)
```

---

## 🚀 Démarrage rapide (développement)

### Prérequis

- Node.js 20+
- npm 9+

### Installation

```bash
# Cloner et installer les dépendances
cd JewelBox-Music-Library
npm install           # installe concurrently à la racine

cd server && npm install
cd ../client && npm install
```

### Configuration

```bash
cp server/.env.example server/.env
```

### Lancer en développement

```bash
# Depuis la racine (lance server + client simultanément)
npm run dev

# Ou séparément :
cd server && npm run dev   # http://localhost:3001
cd client && npm run dev   # http://localhost:5173
```

### Créer le dossier de données

```bash
mkdir -p data/uploads
```

---

## 🧪 Tests

```bash
# Tests serveur (Vitest)
cd server && npm test

# Tests client (Vitest + Testing Library)
cd client && npm test
```

---

## 🐳 Docker

### Build & Run

```bash
docker-compose up --build
```

L'application sera disponible sur **http://localhost:3001**

### Variables d'environnement

| Variable       | Default              | Description                     |
|----------------|----------------------|---------------------------------|
| `PORT`         | `3001`               | Port du serveur                 |
| `HOST`         | `0.0.0.0`            | Interface d'écoute              |
| `DB_PATH`      | `./data/jewelbox.db` | Chemin vers la base SQLite      |
| `UPLOADS_DIR`  | `./data/uploads`     | Dossier pour les pochettes      |
| `CORS_ORIGIN`  | `true`               | Origines CORS autorisées        |

---

## 🌐 API REST

| Méthode  | Endpoint                  | Description                              |
|----------|---------------------------|------------------------------------------|
| `GET`    | `/api/albums`             | Liste paginée (filtres, tri, recherche)  |
| `GET`    | `/api/albums/:id`         | Détail + pistes                          |
| `POST`   | `/api/albums`             | Créer un album                           |
| `PATCH`  | `/api/albums/:id`         | Modifier un album                        |
| `DELETE` | `/api/albums/:id`         | Supprimer un album                       |
| `PATCH`  | `/api/albums/:id/lend`    | Prêter / récupérer                       |
| `GET`    | `/api/albums/genres`      | Liste des genres                         |
| `GET`    | `/api/artists`            | Liste des artistes                       |
| `GET`    | `/api/labels`             | Liste des labels                         |
| `GET`    | `/api/search?q=`          | Recherche MusicBrainz par titre/artiste  |
| `GET`    | `/api/search?ean=`        | Recherche par EAN/code-barres            |
| `GET`    | `/api/search/:mbid`       | Détail complet d'une release MusicBrainz |
| `POST`   | `/api/upload/cover`       | Upload d'une pochette                    |
| `GET`    | `/api/health`             | Health check                             |

### Query params pour `GET /api/albums`

| Param    | Type    | Description                                    |
|----------|---------|------------------------------------------------|
| `page`   | integer | Numéro de page (défaut: 1)                     |
| `limit`  | integer | Albums par page (défaut: 24, max: 100)         |
| `genre`  | string  | Filtrer par genre                              |
| `rating` | integer | Filtrer par note (1-5)                         |
| `sort`   | string  | `title`, `artist`, `year`, `rating`            |
| `order`  | string  | `asc` ou `desc`                                |
| `search` | string  | Recherche sur titre et artiste                 |

---

## 📱 PWA

L'application inclut un **manifest** et un **Service Worker** (via Workbox/vite-plugin-pwa) permettant :

- Installation sur l'écran d'accueil (mobile & desktop)
- Mise en cache des assets statiques
- Cache réseau pour les requêtes API albums
- Cache des pochettes depuis Cover Art Archive

Pour générer les icônes PWA, placez vos images dans `client/public/icons/` :

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
