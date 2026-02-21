// PostgreSQL connection pool with Row-Level Security support

import pg from 'pg';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

let pool: pg.Pool | null = null;

export interface PgConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

function getConfig(): PgConfig {
  return {
    host: process.env.PG_HOST ?? 'localhost',
    port: parseInt(process.env.PG_PORT ?? '5432', 10),
    database: process.env.PG_DATABASE ?? 'orchestree',
    user: process.env.PG_USER ?? 'orchestree',
    password: process.env.PG_PASSWORD ?? 'orchestree',
    max: parseInt(process.env.PG_POOL_MAX ?? '20', 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

export function getPool(): pg.Pool {
  if (pool) return pool;

  const config = getConfig();
  pool = new Pool(config);

  pool.on('error', (err) => {
    logger.error('Unexpected PostgreSQL pool error', { error: err.message });
  });

  pool.on('connect', () => {
    logger.debug('New PostgreSQL connection established');
  });

  return pool;
}

/** Set the tenant context for Row-Level Security on a connection */
export async function setTenantContext(
  client: pg.PoolClient,
  tenantId: string
): Promise<void> {
  await client.query("SET LOCAL app.tenant_id = $1", [tenantId]);
}

/** Get a client with tenant context set (for use within a transaction) */
export async function getTenantClient(
  tenantId: string
): Promise<pg.PoolClient> {
  const client = await getPool().connect();
  await client.query('BEGIN');
  await setTenantContext(client, tenantId);
  return client;
}

/** Release a tenant client, committing or rolling back */
export async function releaseTenantClient(
  client: pg.PoolClient,
  commit = true
): Promise<void> {
  try {
    if (commit) {
      await client.query('COMMIT');
    } else {
      await client.query('ROLLBACK');
    }
  } finally {
    client.release();
  }
}

/** Simple query without tenant context */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params);
}

/** Query with tenant context */
export async function tenantQuery<T extends pg.QueryResultRow = pg.QueryResultRow>(
  tenantId: string,
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await setTenantContext(client, tenantId);
    const result = await client.query<T>(text, params);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Run PostgreSQL migrations */
export async function runPgMigrations(): Promise<void> {
  const p = getPool();

  // Create migration tracking table
  await p.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsDir = join(__dirname, 'migrations');
  if (!existsSync(migrationsDir)) return;

  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const result = await p.query<{ name: string }>('SELECT name FROM schema_migrations');
  const applied = new Set(result.rows.map(r => r.name));

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    const client = await p.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (name) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
      logger.info('Migration applied', { migration: file });
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Migration failed', { migration: file, error: (err as Error).message });
      throw err;
    } finally {
      client.release();
    }
  }
}

/** Check if PostgreSQL is reachable */
export async function checkPgHealth(): Promise<boolean> {
  try {
    const result = await getPool().query('SELECT 1 AS ok');
    return result.rows[0]?.ok === 1;
  } catch {
    return false;
  }
}

/** Gracefully close the pool */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('PostgreSQL pool closed');
  }
}
