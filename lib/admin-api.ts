import type { ProductRecord, StoreSettings, VariantStock } from './storefront';

type UnsafeRecord = Record<string, unknown>;

function hasKey(input: UnsafeRecord, key: string) {
  return Object.prototype.hasOwnProperty.call(input, key);
}

export function cleanText(value: unknown, fallback = '') {
  const text =
    value === undefined || value === null ? fallback : String(value).trim();
  return text;
}

export function cleanNumber(value: unknown, fallback = 0) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }

  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

export function cleanStringArray(value: unknown) {
  const raw = Array.isArray(value)
    ? value
    : String(value || '')
        .split(/\r?\n|,/)
        .map((item) => item.trim());

  return Array.from(
    new Set(raw.map((item) => cleanText(item)).filter(Boolean)),
  );
}

function cleanVisibility(value: unknown) {
  const text = cleanText(value, 'active');
  return text === 'hidden' || text === 'out_of_stock' ? text : 'active';
}

function cleanVariantStocks(value: unknown): VariantStock[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const row = item as UnsafeRecord;

      return {
        color: cleanText(row?.color),
        size: cleanText(row?.size),
        material: cleanText(row?.material),
        stock: Math.max(0, Math.round(cleanNumber(row?.stock, 0))),
      };
    })
    .filter((item) => item.color || item.size || item.material);
}

function cleanSiteCopy(
  input: unknown,
  current: StoreSettings['siteCopy'],
): StoreSettings['siteCopy'] {
  const row = (input || {}) as UnsafeRecord;
  const next = { ...current };

  (Object.keys(current) as Array<keyof StoreSettings['siteCopy']>).forEach(
    (key) => {
      if (hasKey(row, key)) {
        next[key] = cleanText(row[key], current[key]);
      }
    },
  );

  return next;
}

export function slugify(value: string) {
  return (
    cleanText(value)
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `product-${Date.now()}`
  );
}

export function uniqueProductId(
  desired: string,
  products: ProductRecord[],
  currentId = '',
) {
  const base = slugify(desired);
  const used = new Set(
    products
      .map((product) => cleanText(product.id))
      .filter((id) => id && id !== currentId),
  );

  if (!used.has(base)) return base;

  let index = 2;
  while (used.has(`${base}-${index}`)) {
    index += 1;
  }

  return `${base}-${index}`;
}

export function sanitizeProduct(
  input: UnsafeRecord,
  existing?: ProductRecord | null,
  forcedId?: string,
): ProductRecord {
  const title = cleanText(input.title, existing?.title || 'Untitled product');
  const images = cleanStringArray(
    hasKey(input, 'images') ? input.images : existing?.images || [],
  );
  const image = cleanText(input.image, existing?.image || images[0] || '');
  const hoverImage = cleanText(
    input.hoverImage,
    existing?.hoverImage || images[1] || '',
  );
  const gallery = cleanStringArray([image, hoverImage, ...images]);

  return {
    id: forcedId || cleanText(input.id, existing?.id || slugify(title)),
    title,
    category: cleanText(input.category, existing?.category || 'Custom Bangles'),
    brand: cleanText(input.brand, existing?.brand || 'Hyderabadi Churiyan'),
    price: Math.max(
      0,
      Math.round(cleanNumber(input.price, existing?.price || 0)),
    ),
    compareAt:
      input.compareAt === '' || input.compareAt === null
        ? undefined
        : cleanNumber(input.compareAt, existing?.compareAt || 0) || undefined,
    stock: Math.max(
      0,
      Math.round(cleanNumber(input.stock, existing?.stock || 0)),
    ),
    shortDesc: cleanText(input.shortDesc, existing?.shortDesc || ''),
    description: cleanText(input.description, existing?.description || ''),
    image: image || gallery[0] || '',
    hoverImage,
    images: gallery,
    visibility: cleanVisibility(input.visibility || existing?.visibility),
    featured: hasKey(input, 'featured')
      ? !!input.featured
      : !!existing?.featured,
    sizes: cleanStringArray(
      hasKey(input, 'sizes') ? input.sizes : existing?.sizes || [],
    ),
    colors: cleanStringArray(
      hasKey(input, 'colors') ? input.colors : existing?.colors || [],
    ),
    materials: cleanStringArray(
      hasKey(input, 'materials') ? input.materials : existing?.materials || [],
    ),
    variantStocks: cleanVariantStocks(
      hasKey(input, 'variantStocks')
        ? input.variantStocks
        : existing?.variantStocks || [],
    ),
  };
}

export function sanitizeSettings(
  input: UnsafeRecord,
  current: StoreSettings,
): Partial<StoreSettings> {
  const testimonials = Array.isArray(input.testimonials)
    ? input.testimonials
        .map((item) => {
          const row = item as UnsafeRecord;

          return {
            quote: cleanText(row.quote),
            name: cleanText(row.name),
            role: cleanText(row.role),
          };
        })
        .filter((item) => item.quote || item.name || item.role)
    : current.testimonials;

  return {
    storeName: cleanText(input.storeName, current.storeName),
    storeLogo: cleanText(input.storeLogo, current.storeLogo),
    heroTitle: cleanText(input.heroTitle, current.heroTitle),
    heroSubtitle: cleanText(input.heroSubtitle, current.heroSubtitle),
    heroImage: cleanText(input.heroImage, current.heroImage),
    ownerWhatsapp: cleanText(input.ownerWhatsapp, current.ownerWhatsapp),
    currency: cleanText(input.currency, current.currency || 'PKR'),
    instagramHandle: cleanText(input.instagramHandle, current.instagramHandle),
    announcementBarEnabled: hasKey(input, 'announcementBarEnabled')
      ? !!input.announcementBarEnabled
      : current.announcementBarEnabled,
    announcementBarText: cleanText(
      input.announcementBarText,
      current.announcementBarText,
    ),
    saleBannerEnabled: hasKey(input, 'saleBannerEnabled')
      ? !!input.saleBannerEnabled
      : current.saleBannerEnabled,
    saleBannerTitle: cleanText(input.saleBannerTitle, current.saleBannerTitle),
    saleBannerText: cleanText(input.saleBannerText, current.saleBannerText),
    saleBannerButtonText: cleanText(
      input.saleBannerButtonText,
      current.saleBannerButtonText,
    ),
    emailPopupEnabled: hasKey(input, 'emailPopupEnabled')
      ? !!input.emailPopupEnabled
      : current.emailPopupEnabled,
    emailPopupTitle: cleanText(input.emailPopupTitle, current.emailPopupTitle),
    emailPopupText: cleanText(input.emailPopupText, current.emailPopupText),
    testimonials,
    galleryImages: hasKey(input, 'galleryImages')
      ? cleanStringArray(input.galleryImages)
      : current.galleryImages,
    siteCopy: hasKey(input, 'siteCopy')
      ? cleanSiteCopy(input.siteCopy, current.siteCopy)
      : current.siteCopy,
  };
}
