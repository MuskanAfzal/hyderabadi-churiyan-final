import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
})

export async function query(text: string, params?: any[]) {
  return pool.query(text, params)
}
