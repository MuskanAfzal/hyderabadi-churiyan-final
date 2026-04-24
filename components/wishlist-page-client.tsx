'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from './cart-context';

const WISHLIST_KEY = 'wishlist_v1';

type WishlistItem = {
  id: string;
  title: string;
  price: number;
  image: string;
};

export function WishlistPageClient({ currency }: { currency: string }) {
  const { addItem } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        window.localStorage.getItem(WISHLIST_KEY) || '[]',
      );
      setItems(Array.isArray(stored) ? stored : []);
    } catch {
      setItems([]);
    }
  }, []);

  function save(next: WishlistItem[]) {
    setItems(next);
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  }

  return (
    <section
      className={`section wishlistPage${items.length ? '' : ' wishlistPage--empty'}`}
    >
      <div className="container">
        <div className="sectionHead">
          <div>
            <h1>Wishlist</h1>
            <p className="muted">
              Save your favorite pieces and move them into the cart when you are
              ready.
            </p>
          </div>
        </div>

        {!items.length ? (
          <div className="shopNoResults" style={{ display: 'block' }}>
            <p className="muted">Your wishlist is empty right now.</p>
            <div className="card__actions" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" href="/shop">
                Explore the shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid">
            {items.map((item) => (
              <article key={item.id} className="card">
                <Link className="card__img" href={`/product/${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                  />
                </Link>

                <div className="card__body">
                  <div className="card__top">
                    <h3>
                      <Link href={`/product/${item.id}`}>{item.title}</Link>
                    </h3>
                    <div className="price">
                      {currency} {item.price}
                    </div>
                  </div>

                  <div className="card__actions">
                    <button
                      className="btn btn--small btn--primary"
                      type="button"
                      onClick={() => addItem({ ...item }, 1)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="btn btn--small btn--ghost"
                      type="button"
                      onClick={() =>
                        save(items.filter((entry) => entry.id !== item.id))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
