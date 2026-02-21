// Database layer — PostgreSQL (primary) with SQLite fallback for dev

import Database from 'better-sqlite3';
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db: Database.Database | null = null;

// ─── PostgreSQL support ─────────────────────────────────────────────
// When PG_HOST is set, the app uses PostgreSQL via postgres.ts.
// This SQLite module remains as a fallback for local dev without Postgres.

export function isPostgresMode(): boolean {
  return !!process.env.PG_HOST;
}

export function getDatabase(): Database.Database {
  if (isPostgresMode()) {
    throw new Error(
      'SQLite getDatabase() called in PostgreSQL mode. Use postgres.ts imports instead.'
    );
  }

  if (db) return db;

  const dataDir = join(__dirname, '..', '..', '..', 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(join(dataDir, 'orchestree.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);
  return db;
}

function runMigrations(database: Database.Database): void {
  // Create migration tracking table
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const migrationsDir = join(__dirname, 'migrations');
  if (!existsSync(migrationsDir)) return;

  // Only run SQLite-compatible migrations (001, 002)
  const sqliteMigrations = ['001_initial.sql', '002_users.sql'];

  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && sqliteMigrations.includes(f))
    .sort();

  const applied = new Set(
    database
      .prepare('SELECT name FROM schema_migrations')
      .all()
      .map((row) => (row as { name: string }).name)
  );

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    const migrate = database.transaction(() => {
      database.exec(sql);
      database.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)').run(
        file,
        new Date().toISOString()
      );
    });
    migrate();
    logger.info('SQLite migration applied', { migration: file });
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
