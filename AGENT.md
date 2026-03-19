# JewelBox Music Library - AI Agent Documentation

## Overview

JewelBox is a music library management application built with Preact frontend and Fastify backend, using SQLite for data storage.

## Tech Stack

- **Frontend**: Preact + Tabler.io UI components
- **Backend**: Fastify + SQLite/better-sqlite3
- **Build Tools**: Vite (frontend), Vitest (tests)
- **Package Management**: npm workspaces

## Key Architecture

- **Monorepo structure** with hoisted node_modules at root
- **Frontend dev**: Vite on port 5173 with proxy to backend
- **Backend dev**: Fastify on port 3001
- **Database**: SQLite at `server/data/jewelbox.db`
- **File uploads**: `server/data/uploads/`

## Development Commands

```bash
# Start both frontend and backend
npm run dev

# Backend only
cd server && node src/index.js

# Frontend only  
cd client && node ../node_modules/vite/bin/vite.js --port 5173 --host

# Tests
cd server && node ../node_modules/vitest/vitest.mjs run
```

## Project Structure

```bash
JewelBox-Music-Library/
├── client/                 # Preact frontend
│   ├── src/
│   │   ├── api/            # API client functions
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   └── config/        # Configuration (i18n)
├── server/                # Fastify backend
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── db/           # Database queries
│   │   └── utils/        # Utility functions
│   └── data/             # Database and uploads
└── node_modules/         # Hoisted dependencies
```

## Key Features

- Album management (CRUD operations)
- MusicBrainz integration for metadata lookup
- Cover image management with local storage
- i18n support (French/English)
- Star rating system
- Search and filtering
- Responsive UI

## Important Implementation Details

### Database

- Uses better-sqlite3 with named parameters
- All 10 parameters must be explicitly set in createAlbum with ?? null fallbacks
- Database path resolved via path.resolve from server/src

### MusicBrainz Integration

- Rate limited to 1 request per 10 seconds
- Includes retry logic with exponential backoff
- Local caching for search results (5-minute TTL)
- Proper User-Agent headers to avoid blocking
- Graceful fallback when service unavailable

### File Uploads

- Cover images downloaded locally from CoverArtArchive
- Stored in `server/data/uploads/`
- Served via `/uploads/` route
- Filename generated using MD5 hash

### Frontend Architecture

- Component-based with Preact hooks
- Centralized i18n with useI18n hook
- CSS extracted to separate files (no inline styles)
- Lucide icons replacing Tabler where possible

## Common Issues & Solutions

### MusicBrainz Rate Limiting

- 10-second delay between requests
- Cache for repeated searches
- Proper User-Agent headers
- Graceful error handling

### Database Operations

- Explicit null handling for optional fields
- Proper parameter binding for better-sqlite3
- File path resolution注意事项

### Frontend Styling

- All styles in dedicated CSS files
- No inline styles in JSX
- Dark/light theme support

## Development Guidelines

1. Always use i18n for user-facing text
2. Extract styles to CSS files, no inline styles
3. Follow the established component patterns
4. Test database operations carefully
5. Respect MusicBrainz rate limits
6. Use proper error handling and logging

## API Endpoints

- `GET /api/albums` - List albums with pagination/filtering
- `POST /api/albums` - Create new album
- `GET /api/albums/:id` - Get album details
- `PATCH /api/albums/:id` - Update album
- `DELETE /api/albums/:id` - Delete album
- `GET /api/search?q=<query>` - Search MusicBrainz
- `GET /api/search/:mbid` - Get full release details
- `GET /api/albums/genres` - Get all genres

## Environment Setup

- Node.js required
- npm workspaces configuration
- Development server uses concurrently for both frontend/backend
- Production builds frontend to `client/dist`
