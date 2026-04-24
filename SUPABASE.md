# Supabase Setup

This project can use Supabase as its production database and image storage.
It uses Supabase Postgres through `DATABASE_URL`, so no browser-side Supabase
keys are needed for storefront data.

## 1. Create The Database Tables

Open Supabase Dashboard -> SQL Editor and run:

```sql
-- paste database/supabase-schema.sql here
```

The schema creates:

- `products`
- `orders`
- `discounts`
- `reviews`
- `settings`
- `sales_config`
- a public `store-images` storage bucket for uploaded dashboard images

## 2. Environment Variables

Use the Supabase connection pooler URI from:

Supabase Dashboard -> Project Settings -> Database -> Connection string

Set:

```env
DATA_BACKEND=postgres
DATABASE_URL=postgresql://postgres.your-project-ref:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
PGSSL=true

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=store-images
```

Keep these server-only variables out of the browser. Do not prefix the service
role key with `NEXT_PUBLIC_`.

## 3. Move Existing Local Data Into Supabase

After the schema exists and `DATABASE_URL` is set, run:

```bash
npm run db:migrate-json
```

This imports the current files from `data/*.json` into Supabase.

## 4. How The App Chooses Storage

- `DATA_BACKEND=file` or unset: reads local JSON first, useful for offline local work.
- `DATA_BACKEND=postgres`: reads Supabase/Postgres first, with local JSON as a safety fallback if the database is unavailable.

Admin-created/updated products are also mirrored to local JSON as a backup.

## 5. Image Uploads

If `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`
are set, dashboard image uploads go to Supabase Storage and return public object
URLs. If those variables are not set, uploads continue to use `public/uploads`
locally.
