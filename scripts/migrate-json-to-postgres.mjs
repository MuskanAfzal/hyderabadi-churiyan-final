import 'dotenv/config';

import fs from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const connectionString = String(process.env.DATABASE_URL || '').trim();

if (!connectionString) {
  throw new Error('DATABASE_URL is required before running this migration.');
}

const pool = new Pool({
  connectionString,
  ssl:
    String(process.env.PGSSL || 'false').toLowerCase() === 'true'
      ? { rejectUnauthorized: false }
      : false,
});

function readJson(name, fallback) {
  const file = path.join(dataDir, name);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function migrateProducts() {
  const products = readJson('products.json', { products: [] }).products || [];

  for (const product of products) {
    await pool.query(
      `
      insert into products (
        id, title, category, brand, price, compare_at, stock, short_desc,
        description, image, hover_image, images, visibility, featured,
        sizes, colors, materials, variant_stocks
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        $12::jsonb,$13,$14,$15::jsonb,$16::jsonb,$17::jsonb,$18::jsonb
      )
      on conflict (id) do update set
        title = excluded.title,
        category = excluded.category,
        brand = excluded.brand,
        price = excluded.price,
        compare_at = excluded.compare_at,
        stock = excluded.stock,
        short_desc = excluded.short_desc,
        description = excluded.description,
        image = excluded.image,
        hover_image = excluded.hover_image,
        images = excluded.images,
        visibility = excluded.visibility,
        featured = excluded.featured,
        sizes = excluded.sizes,
        colors = excluded.colors,
        materials = excluded.materials,
        variant_stocks = excluded.variant_stocks
      `,
      [
        product.id,
        product.title,
        product.category,
        product.brand || null,
        Number(product.price || 0),
        product.compareAt ?? null,
        product.stock ?? null,
        product.shortDesc || '',
        product.description || '',
        product.image || '',
        product.hoverImage || null,
        JSON.stringify(product.images || []),
        product.visibility || 'active',
        !!product.featured,
        JSON.stringify(product.sizes || []),
        JSON.stringify(product.colors || []),
        JSON.stringify(product.materials || []),
        JSON.stringify(product.variantStocks || []),
      ],
    );
  }

  console.log(`Migrated ${products.length} products.`);
}

async function migrateOrders() {
  const orders = readJson('orders.json', { orders: [] }).orders || [];

  for (const order of orders) {
    await pool.query(
      `
      insert into orders (
        id, created_at, total, status, customer_name, phone, address, notes,
        currency, discount_code, discount_amount, items
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
      on conflict (id) do update set
        total = excluded.total,
        status = excluded.status,
        customer_name = excluded.customer_name,
        phone = excluded.phone,
        address = excluded.address,
        notes = excluded.notes,
        currency = excluded.currency,
        discount_code = excluded.discount_code,
        discount_amount = excluded.discount_amount,
        items = excluded.items
      `,
      [
        order.id,
        order.createdAt || new Date().toISOString(),
        Number(order.total || 0),
        order.status || 'New',
        order.customerName || '',
        order.phone || '',
        order.address || '',
        order.notes || '',
        order.currency || 'PKR',
        order.discountCode || null,
        Number(order.discountAmount || 0),
        JSON.stringify(order.items || []),
      ],
    );
  }

  console.log(`Migrated ${orders.length} orders.`);
}

async function migrateDiscounts() {
  const discounts = readJson('discounts.json', { codes: [] }).codes || [];

  for (const discount of discounts) {
    await pool.query(
      `
      insert into discounts (code, type, value, is_active)
      values ($1,$2,$3,$4)
      on conflict (code) do update set
        type = excluded.type,
        value = excluded.value,
        is_active = excluded.is_active
      `,
      [
        discount.code,
        discount.type === 'fixed' ? 'fixed' : 'percent',
        Number(discount.value || 0),
        !!discount.isActive,
      ],
    );
  }

  console.log(`Migrated ${discounts.length} discounts.`);
}

async function migrateReviews() {
  const reviews = readJson('reviews.json', { reviews: [] }).reviews || [];

  for (const review of reviews) {
    await pool.query(
      `
      insert into reviews (
        id, product_id, name, rating, comment, created_at, is_approved
      ) values ($1,$2,$3,$4,$5,$6,$7)
      on conflict (id) do update set
        product_id = excluded.product_id,
        name = excluded.name,
        rating = excluded.rating,
        comment = excluded.comment,
        is_approved = excluded.is_approved
      `,
      [
        review.id,
        review.productId,
        review.name || '',
        Number(review.rating || 5),
        review.comment || '',
        review.createdAt || new Date().toISOString(),
        review.isApproved !== false,
      ],
    );
  }

  console.log(`Migrated ${reviews.length} reviews.`);
}

async function migrateSettings() {
  const settings = readJson('settings.json', {});
  await pool.query(
    `
    insert into settings (id, data)
    values (1, $1::jsonb)
    on conflict (id) do update set data = excluded.data
    `,
    [JSON.stringify(settings)],
  );
  console.log('Migrated settings.');
}

async function migrateSales() {
  const sales = readJson('sales.json', {});
  await pool.query(
    `
    insert into sales_config (id, data)
    values (1, $1::jsonb)
    on conflict (id) do update set data = excluded.data
    `,
    [JSON.stringify(sales)],
  );
  console.log('Migrated sales config.');
}

try {
  await migrateProducts();
  await migrateOrders();
  await migrateDiscounts();
  await migrateReviews();
  await migrateSettings();
  await migrateSales();
} finally {
  await pool.end();
}
