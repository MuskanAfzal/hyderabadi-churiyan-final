Write-Host "Installing PostgreSQL packages..."

npm install pg @types/pg

Write-Host "Creating postgres helper..."

New-Item -ItemType Directory -Force -Path src\database

@"
import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
})

export async function query(text: string, params?: any[]) {
  return pool.query(text, params)
}
"@ | Set-Content src\database\postgres.ts

Write-Host "Creating SQL schema..."

New-Item -ItemType Directory -Force -Path sql

@"
CREATE TABLE products (
  id UUID PRIMARY KEY,
  title TEXT,
  price INTEGER,
  image TEXT,
  description TEXT
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_name TEXT,
  phone TEXT,
  address TEXT,
  status TEXT,
  created_at TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID,
  product_id UUID,
  qty INTEGER,
  price INTEGER
);

CREATE TABLE discounts (
  id SERIAL PRIMARY KEY,
  code TEXT,
  type TEXT,
  value INTEGER,
  is_active BOOLEAN
);
"@ | Set-Content sql\schema.sql

Write-Host "Done creating Postgres base setup."