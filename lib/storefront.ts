import 'server-only';

import { randomUUID } from 'crypto';
import { unstable_noStore as noStore } from 'next/cache';
import { DiscountsService } from '../src/common/discounts.service';
import { FileDB } from '../src/common/filedb';
import { query } from '../src/common/postgres';
import { ReviewsService } from '../src/common/reviews.service';
import { SalesService } from '../src/common/sales.service';
import { SettingsService } from '../src/common/settings.service';
import { Storage } from '../src/storage/storage.adapter';
import { isProductInStock } from './product-stock';

export type VariantStock = {
  color?: string;
  size?: string;
  material?: string;
  stock: number;
};

export type ProductRecord = {
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
  variantStocks?: VariantStock[];
  originalPrice?: number;
  salePercent?: number;
  onSale?: boolean;
  saleSource?: string;
  reviewAvg?: number;
  reviewCount?: number;
};

export type ReviewSummary = ReturnType<ReviewsService['getSummary']>;
export type StoreSettings = ReturnType<SettingsService['get']>;
export type SaleBanner = ReturnType<SalesService['getBannerState']>;

export type OrderItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
  size?: string;
  color?: string;
  material?: string;
};

export type OrderRecord = {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  currency?: string;
  discountCode?: string;
  discountAmount?: number;
  items: OrderItem[];
};

type OrdersFile = {
  orders: OrderRecord[];
};

const settingsService = new SettingsService();
const salesService = new SalesService();
const reviewsService = new ReviewsService();
const discountsService = new DiscountsService();
const ordersFileDb = new FileDB<OrdersFile>('data/orders.json', {
  orders: [],
});

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function cleanString(value: string | undefined, fallback = '') {
  return String(value || fallback).trim();
}

async function withReview(product: ProductRecord): Promise<ProductRecord> {
  const review = await reviewsService.getSummaryAsync(product.id);
  return { ...product, reviewAvg: review.avg, reviewCount: review.count };
}

async function getStoreMeta(settings: StoreSettings) {
  return {
    settings,
    saleBanner: await salesService.getBannerStateAsync(settings),
    storeName: settings.storeName || process.env.STORE_NAME || 'MiniStore',
    storeLogo: settings.storeLogo || process.env.STORE_LOGO || '',
    currency: settings.currency || process.env.CURRENCY || 'PKR',
    ownerWhatsapp: settings.ownerWhatsapp || process.env.OWNER_WHATSAPP || '',
    instagramHandle: settings.instagramHandle || 'ministore',
    announcementBarEnabled: !!settings.announcementBarEnabled,
    announcementBarText: settings.announcementBarText || '',
    year: new Date().getFullYear(),
  };
}

function mapOrderRow(row: any): OrderRecord {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    total: Number(row.total || 0),
    status: row.status || 'New',
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    notes: row.notes || '',
    currency: row.currency || 'PKR',
    discountCode: row.discount_code || '',
    discountAmount: Number(row.discount_amount || 0),
    items: Array.isArray(row.items) ? row.items : [],
  };
}

function readFileOrders() {
  return ordersFileDb.read().orders || [];
}

function writeFileOrders(orders: OrderRecord[]) {
  ordersFileDb.write({ orders });
}

function warnOrderDatabaseFallback(action: string, error: unknown) {
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.LOG_DATABASE_FALLBACK !== 'true'
  ) {
    return;
  }

  const message = error instanceof Error ? error.message : String(error);
  console.warn(
    `Postgres ${action} failed. Using data/orders.json fallback.`,
    message,
  );
}

function buildWhatsappMessage(order: OrderRecord) {
  const currency = order.currency || process.env.CURRENCY || 'PKR';
  const lines: string[] = [];

  lines.push('New Order');
  lines.push(`Order ID: ${order.id}`);
  lines.push(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  lines.push('');
  lines.push(`Name: ${order.customerName}`);
  lines.push(`Phone: ${order.phone}`);
  lines.push(`Address: ${order.address}`);

  if (order.notes) {
    lines.push(`Notes: ${order.notes}`);
  }

  lines.push('');
  lines.push('Items:');

  order.items.forEach((item) => {
    const variants = [
      item.size ? `Size: ${item.size}` : '',
      item.color ? `Color: ${item.color}` : '',
      item.material ? `Material: ${item.material}` : '',
    ]
      .filter(Boolean)
      .join(', ');

    lines.push(
      `- ${item.title}${variants ? ` (${variants})` : ''} x${item.qty} = ${currency} ${item.price * item.qty}`,
    );
  });

  if (order.discountCode && Number(order.discountAmount || 0) > 0) {
    lines.push('');
    lines.push(
      `Discount: ${order.discountCode} (-${currency} ${order.discountAmount})`,
    );
  }

  lines.push('');
  lines.push(`Total: ${currency} ${order.total}`);

  return lines.join('\n');
}

export async function getStoreContext() {
  noStore();
  return getStoreMeta(await settingsService.getAsync());
}

export async function getHomeData() {
  noStore();

  const settings = await settingsService.getAsync();
  const salesConfig = await salesService.getAsync();
  const list = (await Storage.listProducts()) as ProductRecord[];
  const visible = list.filter((product) => product.visibility !== 'hidden');
  const featuredOnly = visible.filter((product) => !!product.featured);

  const featured = salesService
    .applyToMany(
      featuredOnly.length ? featuredOnly.slice(0, 8) : visible.slice(0, 8),
      salesConfig,
    )
    .map((product) => withReview(product as ProductRecord));

  const categoryMap = new Map<string, ProductRecord[]>();
  visible.forEach((product) => {
    const key = cleanString(product.category, 'Collection');
    if (!categoryMap.has(key)) {
      categoryMap.set(key, []);
    }
    categoryMap.get(key)?.push(product);
  });

  const collections = Array.from(categoryMap.entries()).map(
    ([name, items]) => ({
      name,
      count: items.length,
      image: items.find((item) => item.image)?.image || '',
    }),
  );

  const bestSellers = salesService
    .applyToMany(
      [...visible]
        .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
        .slice(0, 4),
      salesConfig,
    )
    .map((product) => withReview(product as ProductRecord));

  return {
    settings,
    featured: await Promise.all(featured),
    collections,
    bestSellers: await Promise.all(bestSellers),
  };
}

export async function getShopData(filters: {
  q?: string;
  category?: string;
  page?: string;
  limit?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string;
  color?: string;
  material?: string;
  sale?: string;
  inStock?: string;
}) {
  noStore();

  const q = cleanString(filters.q);
  const category = cleanString(filters.category, 'all') || 'all';
  const sort = cleanString(filters.sort, 'latest') || 'latest';
  const minPrice = cleanString(filters.minPrice);
  const maxPrice = cleanString(filters.maxPrice);
  const size = cleanString(filters.size);
  const color = cleanString(filters.color);
  const material = cleanString(filters.material);
  const sale = cleanString(filters.sale);
  const inStock = cleanString(filters.inStock);

  const minPriceValue = minPrice ? Number(minPrice) : null;
  const maxPriceValue = maxPrice ? Number(maxPrice) : null;
  const limit = clamp(Number(filters.limit || 12), 6, 60);
  const page = Math.max(1, Number(filters.page || 1) || 1);
  const salesConfig = await salesService.getAsync();

  const all = (await Storage.listProducts({
    includeHidden: true,
  })) as ProductRecord[];
  const categories = Array.from(
    new Set(all.map((product) => product.category).filter(Boolean)),
  ).sort();
  const allSizes = Array.from(
    new Set(all.flatMap((product) => product.sizes || []).filter(Boolean)),
  ).sort();
  const allColors = Array.from(
    new Set(all.flatMap((product) => product.colors || []).filter(Boolean)),
  ).sort();
  const allMaterials = Array.from(
    new Set(all.flatMap((product) => product.materials || []).filter(Boolean)),
  ).sort();

  const filtered = (await Storage.listProducts({
    q,
    category,
  })) as ProductRecord[];
  let products = salesService.applyToMany(
    filtered,
    salesConfig,
  ) as ProductRecord[];

  if (minPriceValue !== null && Number.isFinite(minPriceValue)) {
    products = products.filter(
      (product) => Number(product.price || 0) >= minPriceValue,
    );
  }

  if (maxPriceValue !== null && Number.isFinite(maxPriceValue)) {
    products = products.filter(
      (product) => Number(product.price || 0) <= maxPriceValue,
    );
  }

  if (size) {
    products = products.filter(
      (product) => Array.isArray(product.sizes) && product.sizes.includes(size),
    );
  }

  if (color) {
    products = products.filter(
      (product) =>
        Array.isArray(product.colors) && product.colors.includes(color),
    );
  }

  if (material) {
    products = products.filter(
      (product) =>
        Array.isArray(product.materials) &&
        product.materials.includes(material),
    );
  }

  if (sale === '1') {
    products = products.filter((product) => !!product.onSale);
  }

  if (inStock === '1') {
    products = products.filter((product) => isProductInStock(product));
  }

  if (sort === 'featured') {
    products = [...products].sort(
      (a, b) => Number(!!b.featured) - Number(!!a.featured),
    );
  } else if (sort === 'price_asc') {
    products = [...products].sort(
      (a, b) => Number(a.price || 0) - Number(b.price || 0),
    );
  } else if (sort === 'price_desc') {
    products = [...products].sort(
      (a, b) => Number(b.price || 0) - Number(a.price || 0),
    );
  }

  products = await Promise.all(products.map((product) => withReview(product)));

  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = clamp(page, 1, totalPages);
  const start = (safePage - 1) * limit;

  return {
    products: products.slice(start, start + limit),
    categories,
    allSizes,
    allColors,
    allMaterials,
    page: safePage,
    limit,
    totalItems,
    totalPages,
    filters: {
      q,
      category,
      sort,
      minPrice,
      maxPrice,
      size,
      color,
      material,
      sale,
      inStock,
    },
  };
}

export async function getProductPageData(id: string) {
  noStore();

  const rawProduct = (await Storage.getProductById(id)) as ProductRecord | null;
  if (!rawProduct || rawProduct.visibility === 'hidden') {
    return null;
  }

  const salesConfig = await salesService.getAsync();
  const product = salesService.applyToProduct(
    rawProduct,
    salesConfig,
  ) as ProductRecord;
  const reviewSummary = await reviewsService.getSummaryAsync(id);
  const all = (await Storage.listProducts()) as ProductRecord[];
  const related = salesService
    .applyToMany(
      all
        .filter(
          (item) =>
            item.id !== rawProduct.id &&
            item.visibility !== 'hidden' &&
            cleanString(item.category) === cleanString(rawProduct.category),
        )
        .slice(0, 4),
      salesConfig,
    )
    .map((item) => withReview(item as ProductRecord));

  return {
    product,
    reviewSummary,
    related: await Promise.all(related),
  };
}

export async function getApiProducts(filters: {
  q?: string;
  category?: string;
  page?: string;
  limit?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string;
  color?: string;
  material?: string;
  sale?: string;
  inStock?: string;
}) {
  const shop = await getShopData(filters);

  return {
    ok: true,
    products: shop.products,
    meta: {
      page: shop.page,
      limit: shop.limit,
      totalItems: shop.totalItems,
      totalPages: shop.totalPages,
    },
  };
}

export async function createReview(
  productId: string,
  input: { name?: string; rating?: number; comment?: string },
) {
  noStore();

  await reviewsService.createAsync({
    productId,
    name: cleanString(input.name, 'Anonymous') || 'Anonymous',
    rating: Number(input.rating || 5),
    comment: cleanString(input.comment),
  });
}

export async function validateDiscount(code: string, subtotal: number) {
  noStore();
  return discountsService.validate(code, subtotal);
}

export async function findOrderById(id: string) {
  noStore();

  try {
    const { rows } = await query(`select * from orders where id = $1 limit 1`, [
      id,
    ]);
    return rows[0] ? mapOrderRow(rows[0]) : null;
  } catch (error) {
    warnOrderDatabaseFallback('order lookup', error);
    return readFileOrders().find((order) => order.id === id) || null;
  }
}

export async function listOrders() {
  noStore();

  try {
    const { rows } = await query(
      `select * from orders order by created_at desc`,
    );
    return rows.map(mapOrderRow);
  } catch (error) {
    warnOrderDatabaseFallback('order list', error);
    return [...readFileOrders()].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
  }
}

export async function updateOrderStatus(id: string, status: string) {
  noStore();

  const safeStatus = cleanString(status, 'New') || 'New';

  try {
    const { rowCount } = await query(
      `update orders set status = $2 where id = $1`,
      [id, safeStatus],
    );

    if ((rowCount ?? 0) > 0) {
      return { ok: true };
    }
  } catch (error) {
    warnOrderDatabaseFallback('order status update', error);
  }

  const orders = readFileOrders();
  const next = orders.map((order) =>
    order.id === id ? { ...order, status: safeStatus } : order,
  );
  writeFileOrders(next);

  return { ok: next.some((order) => order.id === id) };
}

export async function createOrder(input: {
  customerName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  currency?: string;
  discountCode?: string;
  discountAmount?: number;
  items?: OrderItem[];
}) {
  noStore();

  const rawItems = Array.isArray(input.items) ? input.items : [];
  const safeItems: OrderItem[] = [];
  const salesConfig = await salesService.getAsync();

  for (const raw of rawItems) {
    const id = cleanString(raw?.id);
    const qty = Math.max(1, Math.round(Number(raw?.qty || 1)));
    if (!id) {
      continue;
    }

    const product = (await Storage.getProductById(id)) as ProductRecord | null;
    if (!product || product.visibility === 'hidden') {
      continue;
    }

    if (
      !isProductInStock(product, {
        size: cleanString(raw?.size),
        color: cleanString(raw?.color),
        material: cleanString(raw?.material),
      })
    ) {
      continue;
    }

    const priced = salesService.applyToProduct(
      product,
      salesConfig,
    ) as ProductRecord;
    safeItems.push({
      id: priced.id,
      title: priced.title,
      price: Number(priced.price || 0),
      qty,
      image: priced.image || '',
      size: cleanString(raw?.size),
      color: cleanString(raw?.color),
      material: cleanString(raw?.material),
    });
  }

  if (!safeItems.length) {
    throw new Error('No valid items found');
  }

  const subtotal = safeItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const discountAmount = Math.max(0, Number(input.discountAmount || 0));
  const order: OrderRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    total: Math.max(0, subtotal - discountAmount),
    status: 'New',
    customerName: cleanString(input.customerName),
    phone: cleanString(input.phone),
    address: cleanString(input.address),
    notes: cleanString(input.notes),
    currency: cleanString(input.currency, process.env.CURRENCY || 'PKR'),
    discountCode: cleanString(input.discountCode),
    discountAmount,
    items: safeItems,
  };

  try {
    await query(
      `
      insert into orders (
        id, created_at, total, status, customer_name, phone, address, notes, currency,
        discount_code, discount_amount, items
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb
      )
      `,
      [
        order.id,
        order.createdAt,
        order.total,
        order.status,
        order.customerName,
        order.phone,
        order.address,
        order.notes || '',
        order.currency,
        order.discountCode || null,
        order.discountAmount || 0,
        JSON.stringify(order.items || []),
      ],
    );
  } catch (error) {
    warnOrderDatabaseFallback('order create', error);
    writeFileOrders([order, ...readFileOrders()]);
  }

  const settings = await settingsService.getAsync();
  const phone = cleanString(
    settings.ownerWhatsapp,
    process.env.OWNER_WHATSAPP || '',
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsappMessage(order))}`;

  return {
    ok: true,
    orderId: order.id,
    whatsappUrl,
  };
}
