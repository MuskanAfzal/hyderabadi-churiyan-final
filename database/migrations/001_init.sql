CREATE TABLE products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  compare_at INTEGER,
  stock INTEGER,
  short_desc TEXT,
  description TEXT,
  image TEXT,
  hover_image TEXT,
  images JSONB DEFAULT '[]',
  visibility TEXT DEFAULT 'active',
  featured BOOLEAN DEFAULT false,
  sizes JSONB DEFAULT '[]',
  colors JSONB DEFAULT '[]',
  materials JSONB DEFAULT '[]',
  variant_stocks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  total INTEGER DEFAULT 0,
  status TEXT,
  customer_name TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  currency TEXT,
  discount_code TEXT,
  discount_amount INTEGER DEFAULT 0,
  items JSONB DEFAULT '[]'
);

CREATE TABLE discounts (
  code TEXT PRIMARY KEY,
  type TEXT,
  value INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  name TEXT,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true
);

CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  data JSONB DEFAULT '{}'
);

CREATE TABLE sales_config (
  id INTEGER PRIMARY KEY,
  data JSONB DEFAULT '{}'
);
