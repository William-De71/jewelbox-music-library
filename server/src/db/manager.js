import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MANAGER_DB_PATH = path.join(__dirname, '../../data/jewelbox_manager.db');

// Ensure data directory exists
const DATA_DIR = path.dirname(MANAGER_DB_PATH);
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let managerDb = null;

export function getManagerDb() {
  if (!managerDb) {
    managerDb = new Database(MANAGER_DB_PATH);
  }
  return managerDb;
}

// Initialize tables
export function initializeManagerDatabase() {
  try {
    // Create databases table
    const createDatabasesTable = `
      CREATE TABLE IF NOT EXISTS databases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        path TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 0
      )
    `;

    // Create settings table for active database
    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const db = getManagerDb();
    db.exec(createDatabasesTable);
    db.exec(createSettingsTable);

    // Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_databases_name ON databases(name);
      CREATE INDEX IF NOT EXISTS idx_databases_active ON databases(is_active);
    `);

    console.log('[ManagerDB] Database initialized successfully');
  } catch (error) {
    console.error('[ManagerDB] Error initializing database:', error);
    throw error;
  }
}

// Get all databases
export function getAllDatabases() {
  const db = getManagerDb();
  const stmt = db.prepare('SELECT * FROM databases ORDER BY created_at DESC');
  return stmt.all();
}

// Get active database
export function getActiveDatabase() {
  const db = getManagerDb();
  const stmt = db.prepare('SELECT * FROM databases WHERE is_active = 1 LIMIT 1');
  return stmt.get();
}

// Create new database
export function createDatabase(name, description = '') {
  const dbPath = path.join(DATA_DIR, `${name}.db`);
  
  // Create the database file
  const newDb = new Database(dbPath);
  
  // Initialize with standard schema (copy from existing structure)
  initializeCollectionDatabase(newDb);
  newDb.close();

  // Insert into manager
  const db = getManagerDb();
  const stmt = db.prepare(`
    INSERT INTO databases (name, path, description) 
    VALUES (?, ?, ?)
  `);
  
  return stmt.run(name, dbPath, description);
}

// Set active database
export function setActiveDatabase(dbId) {
  const db = getManagerDb();
  // Clear all active flags
  db.exec('UPDATE databases SET is_active = 0');
  
  // Set new active
  const stmt = db.prepare('UPDATE databases SET is_active = 1 WHERE id = ?');
  return stmt.run(dbId);
}

// Delete database
export function deleteDatabase(dbId) {
  const db = getManagerDb();
  const dbRecord = db.prepare('SELECT * FROM databases WHERE id = ?').get(dbId);
  if (!dbRecord) return null;

  // Delete the file
  if (fs.existsSync(dbRecord.path)) {
    fs.unlinkSync(dbRecord.path);
  }

  // Delete from manager
  const stmt = db.prepare('DELETE FROM databases WHERE id = ?');
  return stmt.run(dbId);
}

// Update database
export function updateDatabase(dbId, name, description) {
  const db = getManagerDb();
  const stmt = db.prepare(`
    UPDATE databases 
    SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  return stmt.run(name, description, dbId);
}

// Initialize a collection database with standard schema
function initializeCollectionDatabase(db) {
  // Use the correct schema from schema.js
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS artists (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS labels (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS albums (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      title          TEXT NOT NULL,
      artist_id      INTEGER NOT NULL REFERENCES artists(id) ON DELETE RESTRICT,
      label_id       INTEGER REFERENCES labels(id) ON DELETE SET NULL,
      year           INTEGER,
      genre          TEXT,
      total_duration TEXT,
      ean            TEXT UNIQUE,
      rating         INTEGER CHECK(rating BETWEEN 1 AND 5),
      cover_url      TEXT,
      notes          TEXT,
      is_lent        INTEGER NOT NULL DEFAULT 0 CHECK(is_lent IN (0,1)),
      lent_to        TEXT,
      is_wanted      INTEGER NOT NULL DEFAULT 0 CHECK(is_wanted IN (0,1)),
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tracks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      album_id   INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
      position   INTEGER NOT NULL,
      title      TEXT NOT NULL,
      duration   TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_albums_artist  ON albums(artist_id);
    CREATE INDEX IF NOT EXISTS idx_albums_label   ON albums(label_id);
    CREATE INDEX IF NOT EXISTS idx_albums_genre   ON albums(genre);
    CREATE INDEX IF NOT EXISTS idx_albums_rating  ON albums(rating);
    CREATE INDEX IF NOT EXISTS idx_tracks_album   ON tracks(album_id);
    CREATE INDEX IF NOT EXISTS idx_albums_lent ON albums(is_lent);
    CREATE INDEX IF NOT EXISTS idx_albums_wanted ON albums(is_wanted);
    CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album_id);
  `);

  console.log(`[CollectionDB] Initialized new database`);
}
