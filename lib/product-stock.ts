type VariantStockLike = {
  color?: string;
  size?: string;
  material?: string;
  stock?: number;
};

type ProductStockLike = {
  stock?: number;
  visibility?: string;
  variantStocks?: VariantStockLike[];
};

type VariantSelection = {
  color?: string;
  size?: string;
  material?: string;
};

function clean(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function selected(value: unknown) {
  return clean(value).length > 0;
}

export function variantMatchesSelection(
  variant: VariantStockLike,
  selection: VariantSelection,
) {
  const pairs: Array<keyof VariantSelection> = ['color', 'size', 'material'];

  return pairs.every((key) => {
    const variantValue = clean(variant[key]);
    const selectedValue = clean(selection[key]);
    return !variantValue || !selectedValue || variantValue === selectedValue;
  });
}

export function getAvailableStock(
  product: ProductStockLike,
  selection: VariantSelection = {},
) {
  const variants = Array.isArray(product.variantStocks)
    ? product.variantStocks
    : [];

  if (variants.length) {
    const hasSelection =
      selected(selection.color) ||
      selected(selection.size) ||
      selected(selection.material);
    const scoped = hasSelection
      ? variants.filter((variant) =>
          variantMatchesSelection(variant, selection),
        )
      : variants;

    return scoped.reduce(
      (sum, variant) => sum + Math.max(0, Number(variant.stock || 0)),
      0,
    );
  }

  if (product.visibility === 'out_of_stock') {
    return 0;
  }

  if (product.stock === undefined || product.stock === null) {
    return null;
  }

  return Math.max(0, Number(product.stock || 0));
}

export function isProductInStock(
  product: ProductStockLike,
  selection: VariantSelection = {},
) {
  const available = getAvailableStock(product, selection);
  return available === null
    ? product.visibility !== 'out_of_stock'
    : available > 0;
}
