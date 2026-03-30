import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { SCHEMA } from '../db/schema.js';

// Use an in-memory DB for tests
let db;

function setupTestDb() {
  db = new Database(':memory:');
  db.exec(SCHEMA);
  return db;
}

// Inline minimal versions of query functions for testing against the in-memory DB
function upsertArtist(name) {
  const existing = db.prepare('SELECT id FROM artists WHERE name = ? COLLATE NOCASE').get(name);
  if (existing) return existing.id;
  return db.prepare('INSERT INTO artists (name) VALUES (?)').run(name).lastInsertRowid;
}

function upsertLabel(name) {
  if (!name) return null;
  const existing = db.prepare('SELECT id FROM labels WHERE name = ? COLLATE NOCASE').get(name);
  if (existing) return existing.id;
  return db.prepare('INSERT INTO labels (name) VALUES (?)').run(name).lastInsertRowid;
}

function createAlbum(data) {
  const artist_id = upsertArtist(data.artist_name);
  const label_id = data.label_name ? upsertLabel(data.label_name) : null;
  const insert = db.prepare(`
    INSERT INTO albums (title, artist_id, label_id, year, genre, total_duration, ean, rating, cover_url, notes)
    VALUES (@title, @artist_id, @label_id, @year, @genre, @total_duration, @ean, @rating, @cover_url, @notes)
  `);
  const insertTrack = db.prepare(
    'INSERT INTO tracks (album_id, position, title, duration) VALUES (?, ?, ?, ?)'
  );
  const run = db.transaction(() => {
    const { lastInsertRowid } = insert.run({
      title: data.title,
      artist_id,
      label_id: label_id ?? null,
      year: data.year ?? null,
      genre: data.genre ?? null,
      total_duration: data.total_duration ?? null,
      ean: data.ean ?? null,
      rating: data.rating ?? null,
      cover_url: data.cover_url ?? null,
      notes: data.notes ?? null,
    });
    (data.tracks || []).forEach((t, i) => insertTrack.run(lastInsertRowid, t.position ?? i + 1, t.title, t.duration || null));
    return lastInsertRowid;
  });
  return run();
}

beforeAll(() => setupTestDb());
afterAll(() => db.close());

describe('Artist upsert', () => {
  it('creates a new artist and returns its id', () => {
    const id = upsertArtist('Radiohead');
    expect(typeof id).toBe('number');
    expect(id).toBeGreaterThan(0);
  });

  it('returns the same id for a duplicate artist (case insensitive)', () => {
    const id1 = upsertArtist('Portishead');
    const id2 = upsertArtist('PORTISHEAD');
    expect(id1).toBe(id2);
  });
});

describe('Label upsert', () => {
  it('creates a label and returns its id', () => {
    const id = upsertLabel('XL Recordings');
    expect(typeof id).toBe('number');
  });

  it('returns null for falsy label name', () => {
    expect(upsertLabel(null)).toBeNull();
    expect(upsertLabel('')).toBeNull();
  });
});

describe('Album creation', () => {
  it('creates an album with artist and tracks', () => {
    const id = createAlbum({
      title: 'OK Computer',
      artist_name: 'Radiohead',
      label_name: 'Parlophone',
      year: 1997,
      genre: 'Alternative',
      rating: 5,
      tracks: [
        { position: 1, title: 'Airbag', duration: '4:44' },
        { position: 2, title: 'Paranoid Android', duration: '6:23' },
      ],
    });
    expect(id).toBeGreaterThan(0);

    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(id);
    expect(album.title).toBe('OK Computer');
    expect(album.year).toBe(1997);
    expect(album.rating).toBe(5);

    const tracks = db.prepare('SELECT * FROM tracks WHERE album_id = ? ORDER BY position').all(id);
    expect(tracks).toHaveLength(2);
    expect(tracks[0].title).toBe('Airbag');
    expect(tracks[1].title).toBe('Paranoid Android');
  });

  it('stores is_lent as 0 by default', () => {
    const id = createAlbum({ title: 'Dummy', artist_name: 'Portishead', year: 1994 });
    const album = db.prepare('SELECT is_lent FROM albums WHERE id = ?').get(id);
    expect(album.is_lent).toBe(0);
  });
});

describe('Cascading delete', () => {
  it('deletes tracks when album is deleted', () => {
    const id = createAlbum({
      title: 'Mezzanine',
      artist_name: 'Massive Attack',
      tracks: [{ position: 1, title: 'Angel', duration: '6:11' }],
    });
    db.prepare('DELETE FROM albums WHERE id = ?').run(id);
    const tracks = db.prepare('SELECT * FROM tracks WHERE album_id = ?').all(id);
    expect(tracks).toHaveLength(0);
  });
});

describe('Rating constraint', () => {
  it('rejects a rating outside 1-5', () => {
    const artist_id = upsertArtist('Test Artist');
    expect(() => {
      db.prepare('INSERT INTO albums (title, artist_id, rating) VALUES (?, ?, ?)').run('Bad Album', artist_id, 6);
    }).toThrow();
  });
});

// ── Loan history helpers ──────────────────────────────────────────────────────

function addLoanHistory(albumId, lentTo, lentAt) {
  return db.prepare('INSERT INTO loan_history (album_id, lent_to, lent_at) VALUES (?, ?, ?)')
    .run(albumId, lentTo, lentAt || new Date().toISOString());
}

function closeLoan(albumId) {
  return db.prepare(`UPDATE loan_history SET returned_at = datetime('now')
    WHERE album_id = ? AND returned_at IS NULL`)
    .run(albumId);
}

function getLoanHistory(albumId) {
  return db.prepare('SELECT * FROM loan_history WHERE album_id = ? ORDER BY lent_at DESC')
    .all(albumId);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('lent_at tracking', () => {
  let id;

  beforeAll(() => {
    id = createAlbum({ title: 'Blue Lines', artist_name: 'Massive Attack', year: 1991 });
  });

  it('defaults to null when album is created', () => {
    const row = db.prepare('SELECT lent_at FROM albums WHERE id = ?').get(id);
    expect(row.lent_at).toBeNull();
  });

  it('stores lent_at and lent_to when lending', () => {
    const now = new Date().toISOString();
    db.prepare('UPDATE albums SET is_lent=1, lent_to=?, lent_at=? WHERE id=?').run('Alice', now, id);
    const row = db.prepare('SELECT is_lent, lent_to, lent_at FROM albums WHERE id=?').get(id);
    expect(row.is_lent).toBe(1);
    expect(row.lent_to).toBe('Alice');
    expect(row.lent_at).toBe(now);
  });

  it('clears lent_at and lent_to when returned', () => {
    db.prepare('UPDATE albums SET is_lent=0, lent_to=NULL, lent_at=NULL WHERE id=?').run(id);
    const row = db.prepare('SELECT is_lent, lent_to, lent_at FROM albums WHERE id=?').get(id);
    expect(row.is_lent).toBe(0);
    expect(row.lent_to).toBeNull();
    expect(row.lent_at).toBeNull();
  });
});

describe('Loan history', () => {
  let albumId;

  beforeAll(() => {
    albumId = createAlbum({ title: 'Nevermind', artist_name: 'Nirvana', year: 1991 });
  });

  it('adds a loan history entry', () => {
    addLoanHistory(albumId, 'Bob', '2024-01-10T12:00:00.000Z');
    const history = getLoanHistory(albumId);
    expect(history).toHaveLength(1);
    expect(history[0].lent_to).toBe('Bob');
    expect(history[0].lent_at).toBe('2024-01-10T12:00:00.000Z');
    expect(history[0].returned_at).toBeNull();
  });

  it('closes an open loan and sets returned_at', () => {
    closeLoan(albumId);
    const history = getLoanHistory(albumId);
    expect(history[0].returned_at).not.toBeNull();
  });

  it('does not close already returned loans', () => {
    addLoanHistory(albumId, 'Carol', '2024-06-01T10:00:00.000Z');
    closeLoan(albumId);
    const history = getLoanHistory(albumId);
    expect(history).toHaveLength(2);
    expect(history.every(h => h.returned_at !== null)).toBe(true);
  });

  it('returns history ordered by lent_at descending', () => {
    const history = getLoanHistory(albumId);
    expect(history[0].lent_at > history[1].lent_at).toBe(true);
  });

  it('cascades loan_history deletion when album is deleted', () => {
    db.prepare('DELETE FROM albums WHERE id = ?').run(albumId);
    const remaining = db.prepare('SELECT * FROM loan_history WHERE album_id = ?').all(albumId);
    expect(remaining).toHaveLength(0);
  });
});
