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
