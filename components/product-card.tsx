import Link from 'next/link';
import type { ProductRecord } from '@/lib/storefront';
import { getAvailableStock } from '@/lib/product-stock';
import { AddToCartButton } from './add-to-cart-button';

type ProductCardProps = {
  product: ProductRecord;
  currency: string;
  showBadges?: boolean;
  index?: number;
};

function getStockState(product: ProductRecord) {
  const available = getAvailableStock(product);

  if (available !== null && available <= 0) {
    return { label: 'Out of stock', className: 'stockPill stockPill--out' };
  }

  if (available !== null && available <= 3) {
    return {
      label: `Only ${available} left`,
      className: 'stockPill stockPill--low',
    };
  }

  return { label: 'In stock', className: 'stockPill stockPill--in' };
}

export function ProductCard({
  product,
  currency,
  showBadges = false,
  index = 0,
}: ProductCardProps) {
  const stock = getStockState(product);
  const badge =
    showBadges && index === 0
      ? { label: 'Best Seller', className: 'cardBadge cardBadge--bestseller' }
      : showBadges && product.featured
        ? { label: 'Featured', className: 'cardBadge cardBadge--featured' }
        : showBadges && index > 1
          ? { label: 'New', className: 'cardBadge cardBadge--new' }
          : null;

  return (
    <article className="card">
      <Link className="card__img" href={`/product/${product.id}`}>
        {badge ? <span className={badge.className}>{badge.label}</span> : null}
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="card__body">
        <div className="card__top">
          <h3>
            <Link href={`/product/${product.id}`}>{product.title}</Link>
          </h3>

          <div className="priceBlock">
            <div className="price">
              {currency} {product.price}
            </div>
            {product.onSale &&
            product.originalPrice &&
            product.originalPrice > product.price ? (
              <>
                <div className="compare">
                  {currency} {product.originalPrice}
                </div>
                <div className="saleTag">-{product.salePercent}%</div>
              </>
            ) : null}
          </div>
        </div>

        {'reviewCount' in product ? (
          <div className="reviewMini">
            {product.reviewCount
              ? `Rated ${product.reviewAvg} (${product.reviewCount})`
              : 'No reviews yet'}
          </div>
        ) : null}

        <p className="muted">{product.shortDesc || ''}</p>
        <div className={stock.className}>{stock.label}</div>

        <div className="card__actions">
          <AddToCartButton
            item={{
              id: product.id,
              title: product.title,
              price: product.price,
              image: product.image,
            }}
            disabled={stock.label === 'Out of stock'}
          />
          <Link
            className="btn btn--small btn--ghost"
            href={`/product/${product.id}`}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
