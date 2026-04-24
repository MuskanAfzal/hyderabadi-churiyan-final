require('dotenv').config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

function readJSON(file, fallback) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

async function main() {
  await client.connect();

  const products = readJSON("data/products.json", { products: [] });
  const orders = readJSON("data/orders.json", { orders: [] });
  const discounts = readJSON("data/discounts.json", { codes: [] });

  for (const p of products.products) {
    await client.query(
      `INSERT INTO products(id,title,price,image,description)
       VALUES($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.title, p.price, p.image, p.description]
    );
  }

  for (const o of orders.orders) {
    await client.query(
      `INSERT INTO orders(id,customer_name,phone,address,status,created_at)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO NOTHING`,
      [o.id, o.customerName, o.phone, o.address, o.status, o.createdAt]
    );
  }

  for (const d of discounts.codes) {
    await client.query(
      `INSERT INTO discounts(code,type,value,is_active)
       VALUES($1,$2,$3,$4)
       ON CONFLICT (code) DO NOTHING`,
      [d.code, d.type, d.value, d.isActive]
    );
  }

  await client.end();

  console.log("✅ JSON data imported into PostgreSQL");
}

main().catch(err => {
  console.error(err);
});