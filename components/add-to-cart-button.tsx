'use client';

import { useState } from 'react';
import { useCart } from './cart-context';

type AddToCartButtonProps = {
  item: {
    id: string;
    title: string;
    price: number;
    image?: string;
    size?: string;
    color?: string;
    material?: string;
  };
  qty?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function AddToCartButton({
  item,
  qty = 1,
  disabled,
  className = 'btn btn--small btn--primary',
  children = 'Add to Cart',
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      className={className}
      type="button"
      disabled={disabled}
      onClick={() => {
        addItem(item, qty);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? 'Added' : children}
    </button>
  );
}
