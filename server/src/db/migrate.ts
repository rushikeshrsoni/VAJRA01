import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  console.log('Running database migrations...');
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');
    console.log('Database migrations completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// If run directly via CLI
if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
