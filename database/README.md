PROJECT DATABASE SETUP

Supabase setup:
Run database/supabase-schema.sql in the Supabase SQL Editor, then set:

DATA_BACKEND=postgres
DATABASE_URL=your Supabase pooled Postgres connection string
PGSSL=true

See SUPABASE.md in the project root for the full setup and migration steps.

1 Install PostgreSQL
Download:
https://www.postgresql.org/download/

2 Create .env

DATABASE_URL=postgresql://postgres:admin@localhost:5432/nest_ecommerce
PGSSL=false

3 Install project dependencies

npm install

4 Run database setup

powershell -ExecutionPolicy Bypass -File .\database\setup-db.ps1

5 Start the server

npm run start:dev

Your store will run on:
http://localhost:3000
