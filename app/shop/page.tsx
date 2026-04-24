import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { getShopData, getStoreContext } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildShopUrl(filters: Record<string, string>, page: number) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  params.set('page', String(page));

  return `/shop?${params.toString()}`;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [shop, store] = await Promise.all([
    getShopData({
      q: getValue(params.q),
      category: getValue(params.category),
      page: getValue(params.page),
      limit: getValue(params.limit),
      sort: getValue(params.sort),
      minPrice: getValue(params.minPrice),
      maxPrice: getValue(params.maxPrice),
      size: getValue(params.size),
      color: getValue(params.color),
      material: getValue(params.material),
      sale: getValue(params.sale),
      inStock: getValue(params.inStock),
    }),
    getStoreContext(),
  ]);

  const filterQuery = {
    q: shop.filters.q,
    category: shop.filters.category !== 'all' ? shop.filters.category : '',
    limit: String(shop.limit),
    sort: shop.filters.sort !== 'latest' ? shop.filters.sort : '',
    minPrice: shop.filters.minPrice,
    maxPrice: shop.filters.maxPrice,
    size: shop.filters.size,
    color: shop.filters.color,
    material: shop.filters.material,
    sale: shop.filters.sale,
    inStock: shop.filters.inStock,
  };
  const heroProducts = shop.products.slice(0, 4);
  const copy = store.settings.siteCopy;
  const activeCollection =
    shop.filters.category !== 'all'
      ? shop.filters.category
      : copy.shopTitleFallback;

  return (
    <section className="shopAtelierPage">
      <div className="container atelierHero">
        <div className="atelierHero__copy">
          <span className="atelierKicker">{copy.shopKicker}</span>
          <h1>{activeCollection}</h1>
          <p>{copy.shopIntro}</p>
          <div className="atelierHero__actions">
            <Link
              className="btn btn--primary"
              href="/shop?category=Custom%20Bangles"
            >
              {copy.shopPrimaryButton}
            </Link>
            <Link
              className="btn btn--ghost"
              href="/shop?category=Bridal%20Bangles"
            >
              {copy.shopSecondaryButton}
            </Link>
          </div>
        </div>

        <div className="atelierMosaic" aria-label="Featured designs">
          {heroProducts.map((product, index) => (
            <Link
              key={product.id}
              className={`atelierMosaic__item atelierMosaic__item--${index + 1}`}
              href={`/product/${product.id}`}
            >
              <img
                src={product.image}
                alt={product.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <span>{product.category}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="container atelierControls">
        <div className="atelierCategoryRail" aria-label="Shop categories">
          <Link
            className={`atelierCategory${shop.filters.category === 'all' ? ' is-active' : ''}`}
            href="/shop"
          >
            All
          </Link>
          {shop.categories.map((category) => (
            <Link
              key={category}
              className={`atelierCategory${shop.filters.category === category ? ' is-active' : ''}`}
              href={`/shop?category=${encodeURIComponent(category)}`}
            >
              {category}
            </Link>
          ))}
        </div>

        <form className="atelierFilterDock" method="GET" action="/shop">
          <div className="atelierFilterDock__search">
            <input
              className="input"
              name="q"
              placeholder="Search designs"
              defaultValue={shop.filters.q}
            />
          </div>

          <select
            className="select"
            name="category"
            defaultValue={shop.filters.category}
          >
            <option value="all">All categories</option>
            {shop.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="select"
            name="sort"
            defaultValue={shop.filters.sort}
          >
            <option value="latest">Latest</option>
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <details className="atelierMoreFilters">
            <summary>More Filters</summary>
            <select
              className="select"
              name="size"
              defaultValue={shop.filters.size}
            >
              <option value="">All Sizes</option>
              {shop.allSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <select
              className="select"
              name="color"
              defaultValue={shop.filters.color}
            >
              <option value="">All Colors</option>
              {shop.allColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            <select
              className="select"
              name="material"
              defaultValue={shop.filters.material}
            >
              <option value="">All Materials</option>
              {shop.allMaterials.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              name="minPrice"
              placeholder="Min price"
              defaultValue={shop.filters.minPrice}
            />
            <input
              className="input"
              type="number"
              name="maxPrice"
              placeholder="Max price"
              defaultValue={shop.filters.maxPrice}
            />
            <label className="checkInline">
              <input
                type="checkbox"
                name="inStock"
                value="1"
                defaultChecked={shop.filters.inStock === '1'}
              />
              <span>In stock</span>
            </label>
          </details>

          <input type="hidden" name="limit" value={shop.limit} />
          <button className="btn btn--primary" type="submit">
            Apply
          </button>
          <Link className="btn btn--ghost" href="/shop">
            Reset
          </Link>
        </form>

        <div className="atelierResultsHead">
          <span>{shop.totalItems} designs</span>
          <h2>
            {shop.filters.category !== 'all'
              ? shop.filters.category
              : 'Latest festive pieces'}
          </h2>
        </div>

        {shop.products.length ? (
          <div className="grid atelierProductGrid">
            {shop.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={store.currency}
              />
            ))}
          </div>
        ) : (
          <div className="shopNoResults" style={{ display: 'block' }}>
            <p className="muted">No products found for the selected filters.</p>
          </div>
        )}

        <div className="pagination">
          <Link
            className={`pageBtn${shop.page <= 1 ? ' disabled' : ''}`}
            href={
              shop.page <= 1 ? '#' : buildShopUrl(filterQuery, shop.page - 1)
            }
          >
            Prev
          </Link>

          <div className="pageInfo">
            Page <strong>{shop.page}</strong> of{' '}
            <strong>{shop.totalPages}</strong>
            <span className="muted small">({shop.totalItems} items)</span>
          </div>

          <Link
            className={`pageBtn${shop.page >= shop.totalPages ? ' disabled' : ''}`}
            href={
              shop.page >= shop.totalPages
                ? '#'
                : buildShopUrl(filterQuery, shop.page + 1)
            }
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}
