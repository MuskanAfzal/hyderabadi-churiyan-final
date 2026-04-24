import { query } from '../common/postgres';
import { FileDB } from '../common/filedb';
import { preferDatabase } from '../common/data-backend';

type ProductVariantStock = {
  color?: string;
  size?: string;
  material?: string;
  stock: number;
};

type Product = {
  id: string;
  title: string;
  category: string;
  brand?: string;
  price: number;
  compareAt?: number;
  stock?: number;
  shortDesc: string;
  description: string;
  image: string;
  hoverImage?: string;
  images?: string[];
  visibility?: 'active' | 'hidden' | 'out_of_stock';
  featured?: boolean;
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  variantStocks?: ProductVariantStock[];
};

type ProductsFile = {
  products: Product[];
};

const fallbackImage =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80';
const productFileDb = new FileDB<ProductsFile>('data/products.json', {
  products: [],
});

function toArray(v: any): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x || '').trim()).filter(Boolean);
}

function toVariantStocks(v: any): ProductVariantStock[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({
      color: String(x?.color || '').trim(),
      size: String(x?.size || '').trim(),
      material: String(x?.material || '').trim(),
      stock: Math.max(0, Math.round(Number(x?.stock || 0))),
    }))
    .filter((x) => x.color || x.size || x.material);
}

function normalizeProduct(p: Product): Product {
  const imagesRaw = Array.isArray(p.images) ? p.images : [];
  const hoverImage = String(p.hoverImage || '').trim();

  const cleanedImages = Array.from(
    new Set(
      [p.image, hoverImage, ...imagesRaw]
        .map((x) => String(x || '').trim())
        .filter(Boolean),
    ),
  );
  const image =
    String(p.image || '').trim() || cleanedImages[0] || fallbackImage;

  return {
    ...p,
    id: String(p.id || '').trim(),
    title: String(p.title || '').trim(),
    category: String(p.category || '').trim(),
    brand: String(p.brand || '').trim(),
    price: Number(p.price || 0),
    compareAt:
      p.compareAt !== undefined &&
      p.compareAt !== null &&
      String(p.compareAt).trim() !== ''
        ? Number(p.compareAt)
        : undefined,
    stock:
      p.stock !== undefined && p.stock !== null && String(p.stock).trim() !== ''
        ? Math.max(0, Math.round(Number(p.stock)))
        : undefined,
    shortDesc: String(p.shortDesc || '').trim(),
    description: String(p.description || '').trim(),
    image,
    hoverImage,
    images: cleanedImages,
    visibility: (p.visibility || 'active') as Product['visibility'],
    featured: !!p.featured,
    sizes: toArray(p.sizes),
    colors: toArray(p.colors),
    materials: toArray(p.materials),
    variantStocks: toVariantStocks(p.variantStocks),
  };
}

function readFileProducts() {
  return (productFileDb.read().products || []).map((product) =>
    normalizeProduct(product),
  );
}

function writeFileProducts(products: Product[]) {
  productFileDb.write({
    products: products.map((product) => normalizeProduct(product)),
  });
}

function upsertFileProduct(product: Product) {
  const normalized = normalizeProduct(product);
  const products = readFileProducts();
  const index = products.findIndex((item) => item.id === normalized.id);
  const next =
    index >= 0
      ? products.map((item) => (item.id === normalized.id ? normalized : item))
      : [normalized, ...products];

  writeFileProducts(next);
}

function readLocalCatalog() {
  const products = readFileProducts();
  return products.length ? products : null;
}

function warnDatabaseFallback(action: string, error: unknown) {
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.LOG_DATABASE_FALLBACK !== 'true'
  ) {
    return;
  }

  const message = error instanceof Error ? error.message : String(error);
  console.warn(
    `Postgres ${action} failed. Using data/products.json fallback.`,
    message,
  );
}

function mapRow(row: any): Product {
  return normalizeProduct({
    id: row.id,
    title: row.title,
    category: row.category,
    brand: row.brand || '',
    price: Number(row.price || 0),
    compareAt: row.compare_at ?? undefined,
    stock: row.stock ?? undefined,
    shortDesc: row.short_desc || '',
    description: row.description || '',
    image: row.image || '',
    hoverImage: row.hover_image || '',
    images: Array.isArray(row.images) ? row.images : [],
    visibility: row.visibility || 'active',
    featured: !!row.featured,
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    materials: Array.isArray(row.materials) ? row.materials : [],
    variantStocks: Array.isArray(row.variant_stocks) ? row.variant_stocks : [],
  });
}

export const Storage = {
  async listProducts(params?: {
    q?: string;
    category?: string;
    includeHidden?: boolean;
  }) {
    let out: Product[];
    const localCatalog = readLocalCatalog();

    if (localCatalog && !preferDatabase()) {
      out = localCatalog;
    } else {
      try {
        const { rows } = await query(
          `select * from products order by created_at desc`,
        );
        out = rows.map(mapRow);
      } catch (error) {
        warnDatabaseFallback('product list', error);
        out = readFileProducts();
      }
    }

    const category = String(params?.category || 'all').toLowerCase();
    const q = String(params?.q || '')
      .toLowerCase()
      .trim();
    const includeHidden = !!params?.includeHidden;

    if (!includeHidden) {
      out = out.filter((p) => (p.visibility || 'active') !== 'hidden');
    }

    if (category !== 'all') {
      out = out.filter(
        (p) => String(p.category || '').toLowerCase() === category,
      );
    }

    if (q) {
      out = out.filter(
        (p) =>
          String(p.title || '')
            .toLowerCase()
            .includes(q) ||
          String(p.shortDesc || '')
            .toLowerCase()
            .includes(q) ||
          String(p.category || '')
            .toLowerCase()
            .includes(q) ||
          String(p.brand || '')
            .toLowerCase()
            .includes(q),
      );
    }

    return out;
  },

  async getProductById(id: string) {
    const localCatalog = readLocalCatalog();
    if (localCatalog && !preferDatabase()) {
      return localCatalog.find((product) => product.id === id) || null;
    }

    try {
      const { rows } = await query(
        `select * from products where id = $1 limit 1`,
        [id],
      );
      return rows[0] ? mapRow(rows[0]) : null;
    } catch (error) {
      warnDatabaseFallback('product lookup', error);
      return readFileProducts().find((product) => product.id === id) || null;
    }
  },

  async createProduct(p: Product) {
    const product = normalizeProduct(p);

    try {
      await query(
        `
        insert into products (
          id, title, category, brand, price, compare_at, stock, short_desc, description,
          image, hover_image, images, visibility, featured, sizes, colors, materials, variant_stocks
        ) values (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,
          $10,$11,$12::jsonb,$13,$14,$15::jsonb,$16::jsonb,$17::jsonb,$18::jsonb
        )
        `,
        [
          product.id,
          product.title,
          product.category,
          product.brand || null,
          product.price,
          product.compareAt ?? null,
          product.stock ?? null,
          product.shortDesc,
          product.description,
          product.image,
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
    } catch (error) {
      warnDatabaseFallback('product create', error);
    }

    upsertFileProduct(product);

    return product;
  },

  async updateProduct(id: string, patch: Partial<Product>) {
    const current = await this.getProductById(id);
    if (!current) return null;

    const next = normalizeProduct({ ...current, ...patch } as Product);

    try {
      await query(
        `
        update products
        set
          title = $2,
          category = $3,
          brand = $4,
          price = $5,
          compare_at = $6,
          stock = $7,
          short_desc = $8,
          description = $9,
          image = $10,
          hover_image = $11,
          images = $12::jsonb,
          visibility = $13,
          featured = $14,
          sizes = $15::jsonb,
          colors = $16::jsonb,
          materials = $17::jsonb,
          variant_stocks = $18::jsonb
        where id = $1
        `,
        [
          id,
          next.title,
          next.category,
          next.brand || null,
          next.price,
          next.compareAt ?? null,
          next.stock ?? null,
          next.shortDesc,
          next.description,
          next.image,
          next.hoverImage || null,
          JSON.stringify(next.images || []),
          next.visibility || 'active',
          !!next.featured,
          JSON.stringify(next.sizes || []),
          JSON.stringify(next.colors || []),
          JSON.stringify(next.materials || []),
          JSON.stringify(next.variantStocks || []),
        ],
      );
    } catch (error) {
      warnDatabaseFallback('product update', error);
    }

    upsertFileProduct(next);

    return next;
  },

  async deleteProduct(id: string) {
    let removed = false;

    try {
      const { rowCount } = await query(`delete from products where id = $1`, [
        id,
      ]);
      removed = (rowCount ?? 0) > 0;
    } catch (error) {
      warnDatabaseFallback('product delete', error);
    }

    const products = readFileProducts();
    const next = products.filter((product) => product.id !== id);
    writeFileProducts(next);

    return removed || next.length !== products.length;
  },
};
