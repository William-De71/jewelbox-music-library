import Database from 'better-sqlite3';
import { SCHEMA } from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const MANAGER_DB_PATH = path.join(DATA_DIR, 'jewelbox_manager.db');

let db;
let currentDbPath = null;

function getManagerDb() {
  const managerDb = new Database(MANAGER_DB_PATH);
  return managerDb;
}

export function getDb() {
  // Get active database from manager
  const managerDb = getManagerDb();
  const activeDb = managerDb.prepare('SELECT * FROM databases WHERE is_active = 1 LIMIT 1').get();
  managerDb.close();
  
  if (!activeDb) {
    throw new Error('No active database found');
  }
  
  // If database changed or not initialized, reinitialize
  if (!db || currentDbPath !== activeDb.path) {
    if (db) {
      db.close();
    }
    
    if (!fs.existsSync(activeDb.path)) {
      throw new Error('Active database file not found');
    }
    
    db = new Database(activeDb.path);
    currentDbPath = activeDb.path;
  }
  
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
    currentDbPath = null;
  }
}
