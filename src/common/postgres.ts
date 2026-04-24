import 'dotenv/config';
import { Pool } from 'pg';

const sslEnabled =
  String(process.env.PGSSL || 'false').toLowerCase() === 'true';
const connectionString = String(process.env.DATABASE_URL || '').trim();
export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: Number(process.env.PGCONNECT_TIMEOUT_MS || 1500),
    })
  : null;

export async function query<T = any>(text: string, params: any[] = []) {
  if (!pool) {
    throw new Error('DATABASE_URL is missing. Check your .env file.');
  }

  const result = await pool.query(text, params);
  return result as { rows: T[]; rowCount: number | null };
}
