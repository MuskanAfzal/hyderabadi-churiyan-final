import type { ProductRecord } from './storefront';

export type ProductCatalog = {
  brands: string[];
  categories: string[];
  colors: string[];
  materials: string[];
  sizes: string[];
};

function uniqueSorted(values: Array<string | undefined>) {
  return Array.from(
    new Set(values.map((value) => String(value || '').trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
}

export function buildProductCatalog(products: ProductRecord[]): ProductCatalog {
  return {
    brands: uniqueSorted(products.map((product) => product.brand)),
    categories: uniqueSorted(products.map((product) => product.category)),
    colors: uniqueSorted(products.flatMap((product) => product.colors || [])),
    materials: uniqueSorted(
      products.flatMap((product) => product.materials || []),
    ),
    sizes: uniqueSorted(products.flatMap((product) => product.sizes || [])),
  };
}
