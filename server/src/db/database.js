import Database from 'better-sqlite3';
import { SCHEMA } from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(process.env.DB_PATH || path.join(__dirname, '../../data/jewelbox.db'));

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.exec(SCHEMA);
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
