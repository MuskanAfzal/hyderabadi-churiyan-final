'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const RECENTLY_VIEWED_KEY = 'recent_products_v1';

type ViewedItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  url: string;
};

export function RecentlyViewed({
  currentId,
  currency,
}: {
  currentId: string;
  currency: string;
}) {
  const [items, setItems] = useState<ViewedItem[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        window.localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]',
      );
      setItems(
        stored
          .filter((item: ViewedItem) => String(item.id) !== String(currentId))
          .slice(0, 4),
      );
    } catch {
      setItems([]);
    }
  }, [currentId]);

  if (!items.length) {
    return <p className="muted">No recently viewed products yet.</p>;
  }

  return (
    <div id="recentlyViewedGrid">
      {items.map((item) => (
        <article key={item.id} className="card">
          <Link className="card__img" href={item.url}>
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
                <Link href={item.url}>{item.title}</Link>
              </h3>
              <div className="price">
                {currency} {item.price}
              </div>
            </div>
            <div className="card__actions">
              <Link className="btn btn--small btn--ghost" href={item.url}>
                View Product
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
