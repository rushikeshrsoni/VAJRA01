import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

/**
 * Standard query without user RLS context (e.g. auth lookup, migration)
 */
export const query = async (text: string, params?: any[]) => {
  return pool.query(text, params);
};

/**
 * Executes a query with Row Level Security enforced via app.current_user_id
 */
export const userQuery = async (userId: string, text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    await client.query("SELECT set_config('app.current_user_id', $1, false)", [userId]);
    const res = await client.query(text, params);
    return res;
  } finally {
    try {
      await client.query("SELECT set_config('app.current_user_id', '', false)");
    } catch {
      // Ignore reset error
    }
    client.release();
  }
};

/**
 * Helper to run a callback within a user-scoped database client transaction
 */
export const withUserClient = async <T>(userId: string, fn: (client: pg.PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("SELECT set_config('app.current_user_id', $1, false)", [userId]);
    const result = await fn(client);
    return result;
  } finally {
    try {
      await client.query("SELECT set_config('app.current_user_id', '', false)");
    } catch {
      // Ignore reset error
    }
    client.release();
  }
};
