import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
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
  const migrationsDir = join(__dirname, 'migrations');
  const migrationFile = join(migrationsDir, '001_initial.sql');

  if (existsSync(migrationFile)) {
    const sql = readFileSync(migrationFile, 'utf-8');
    database.exec(sql);
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
