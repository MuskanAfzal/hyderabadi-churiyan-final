'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ProductRecord } from '@/lib/storefront';
import { getAvailableStock } from '@/lib/product-stock';
import { useCart } from './cart-context';

const WISHLIST_KEY = 'wishlist_v1';
const RECENTLY_VIEWED_KEY = 'recent_products_v1';

type ProductDetailClientProps = {
  product: ProductRecord;
  currency: string;
};

function loadWishlist() {
  try {
    return JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || '[]');
  } catch {
    return [];
  }
}

export function ProductDetailClient({
  product,
  currency,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const gallery = (
    product.images && product.images.length ? product.images : [product.image]
  ).filter(Boolean);
  const [activeImage, setActiveImage] = useState(gallery[0] || product.image);
  const [size, setSize] = useState(product.sizes?.[0] || '');
  const [color, setColor] = useState(product.colors?.[0] || '');
  const [material, setMaterial] = useState(product.materials?.[0] || '');
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const items = loadWishlist();
    setWishlisted(
      items.some((item: any) => String(item.id) === String(product.id)),
    );

    const nextItems = items;
    void nextItems;
  }, [product.id]);

  useEffect(() => {
    const current = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      url: `/product/${product.id}`,
    };

    try {
      const items = JSON.parse(
        window.localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]',
      );
      const next = [
        current,
        ...items.filter((item: any) => String(item.id) !== String(product.id)),
      ].slice(0, 8);
      window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    } catch {
      window.localStorage.setItem(
        RECENTLY_VIEWED_KEY,
        JSON.stringify([current]),
      );
    }
  }, [product.id, product.image, product.price, product.title]);

  const stockState = useMemo(() => {
    const stock = getAvailableStock(product, { color, size, material });

    if (stock === null) {
      return {
        label: 'In stock',
        className: 'variantStockInfo is-in',
        disabled: false,
      };
    }

    if (stock <= 0) {
      return {
        label: 'Out of stock',
        className: 'variantStockInfo is-out',
        disabled: true,
      };
    }

    if (stock <= 3) {
      return {
        label: `Only ${stock} left`,
        className: 'variantStockInfo is-low',
        disabled: false,
      };
    }

    return {
      label: 'In stock',
      className: 'variantStockInfo is-in',
      disabled: false,
    };
  }, [
    color,
    material,
    product.stock,
    product.variantStocks,
    product.visibility,
    size,
  ]);

  function toggleWishlist() {
    const items = loadWishlist();
    const exists = items.some(
      (item: any) => String(item.id) === String(product.id),
    );

    const next = exists
      ? items.filter((item: any) => String(item.id) !== String(product.id))
      : [
          {
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
          },
          ...items,
        ];

    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    setWishlisted(!exists);
  }

  return (
    <div className="hcProductShell">
      <div className="container hcProductLayout">
        <section className="hcProductGallery">
          <span className="hcProductBadge">{product.category}</span>
          <div className="hcProductMainImage">
            <img src={activeImage} alt={product.title} />
          </div>

          {gallery.length > 1 ? (
            <div className="hcProductThumbs">
              {gallery.map((image) => (
                <button
                  key={image}
                  type="button"
                  className={`hcProductThumb${image === activeImage ? ' is-active' : ''}`}
                  onClick={() => setActiveImage(image)}
                >
                  <img
                    src={image}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <aside className="hcProductPanel">
          <Link className="hcProductBack" href="/shop">
            Back to shop
          </Link>

          <div className="hcProductTitleRow">
            <h1>{product.title}</h1>
            <button
              className="hcSaveBtn"
              type="button"
              onClick={toggleWishlist}
            >
              {wishlisted ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="hcProductPrice">
            <strong>
              {currency} {product.price}
            </strong>
            {product.onSale &&
            product.originalPrice &&
            product.originalPrice > product.price ? (
              <>
                <span>
                  {currency} {product.originalPrice}
                </span>
                <em>-{product.salePercent}%</em>
              </>
            ) : null}
            {!product.onSale && product.compareAt ? (
              <span>
                {currency} {product.compareAt}
              </span>
            ) : null}
          </div>

          <p className="hcProductIntro">{product.shortDesc || ''}</p>
          <p className="hcProductReviews">
            {product.reviewCount
              ? `Rated ${product.reviewAvg} (${product.reviewCount} reviews)`
              : 'No reviews yet'}
          </p>

          {product.sizes?.length ||
          product.colors?.length ||
          product.materials?.length ? (
            <div className="hcVariantGrid">
              {product.sizes?.length ? (
                <label>
                  <span>Size</span>
                  <select
                    value={size}
                    onChange={(event) => setSize(event.target.value)}
                  >
                    {product.sizes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {product.colors?.length ? (
                <label>
                  <span>Color</span>
                  <select
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                  >
                    {product.colors.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {product.materials?.length ? (
                <label>
                  <span>Material</span>
                  <select
                    value={material}
                    onChange={(event) => setMaterial(event.target.value)}
                  >
                    {product.materials.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
          ) : null}

          <div className="hcStockLine">{stockState.label}</div>

          <div className="hcBuyRow">
            <label>
              <span>Qty</span>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(event) =>
                  setQty(Math.max(1, Number(event.target.value || 1)))
                }
              />
            </label>

            <button
              className="hcAddBtn"
              type="button"
              disabled={stockState.disabled}
              onClick={() => {
                addItem(
                  {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                    size,
                    color,
                    material,
                  },
                  qty,
                );
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1200);
              }}
            >
              {added ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>

          <Link className="hcCartLink" href="/cart">
            Go to Cart
          </Link>

          <div className="hcTrustGrid">
            <span>Custom sizing available</span>
            <span>Made for festive wear</span>
            <span>Premium finishing</span>
          </div>

          <div className="hcProductDetails">
            <h2>Details</h2>
            <p>{product.description || ''}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
