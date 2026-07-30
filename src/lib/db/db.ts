import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Use PGDATABASE_URL if available (deployment), otherwise fall back to localhost
const pool = process.env.PGDATABASE_URL
  ? new Pool({ connectionString: process.env.PGDATABASE_URL, max: 20, idleTimeoutMillis: 30000, ssl: { rejectUnauthorized: false } })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'nodecoda',
      max: 20,
      idleTimeoutMillis: 30000,
    });

export const db = drizzle(pool, { schema });

export async function closeDb() {
  await pool.end();
}