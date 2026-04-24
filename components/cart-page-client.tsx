'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useCart } from './cart-context';
import type { StoreSettings } from '@/lib/storefront';

const DISCOUNT_KEY = 'discount_v1';

type AppliedDiscount = {
  code: string;
  discount: number;
};

function loadDiscount(): AppliedDiscount | null {
  try {
    return JSON.parse(window.localStorage.getItem(DISCOUNT_KEY) || 'null');
  } catch {
    return null;
  }
}

type CartCopy = Pick<
  StoreSettings['siteCopy'],
  'cartEyebrow' | 'cartTitle' | 'cartIntro' | 'cartEmptyTitle' | 'cartEmptyText'
>;

export function CartPageClient({
  currency,
  copy,
}: {
  currency: string;
  copy: CartCopy;
}) {
  const { items, count, subtotal, setQty, removeItem, clear } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] =
    useState<AppliedDiscount | null>(null);
  const [status, setStatus] = useState('');
  const total = useMemo(
    () => Math.max(0, subtotal - Number(appliedDiscount?.discount || 0)),
    [appliedDiscount, subtotal],
  );

  useEffect(() => {
    const saved = loadDiscount();
    if (saved) {
      setAppliedDiscount(saved);
      setCouponCode(saved.code || '');
    }
  }, []);

  useEffect(() => {
    if (appliedDiscount) {
      window.localStorage.setItem(
        DISCOUNT_KEY,
        JSON.stringify(appliedDiscount),
      );
    } else {
      window.localStorage.removeItem(DISCOUNT_KEY);
    }
  }, [appliedDiscount]);

  async function applyCoupon() {
    if (!couponCode.trim()) {
      setAppliedDiscount(null);
      setStatus('');
      return;
    }

    const response = await fetch('/api/discounts/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode.trim(), subtotal }),
    });
    const data = await response.json();

    if (data?.ok) {
      setAppliedDiscount({
        code: data.code,
        discount: Number(data.discount || 0),
      });
      setStatus(`Applied ${data.code} for ${currency} ${data.discount}`);
      return;
    }

    setAppliedDiscount(null);
    setStatus(data?.error || 'Invalid discount code');
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!items.length) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: String(form.get('customerName') || ''),
        phone: String(form.get('phone') || ''),
        address: String(form.get('address') || ''),
        notes: String(form.get('notes') || ''),
        currency,
        discountCode: appliedDiscount?.code || '',
        discountAmount: Number(appliedDiscount?.discount || 0),
        items,
      }),
    });
    const data = await response.json();

    if (data?.ok && data?.whatsappUrl) {
      clear();
      setAppliedDiscount(null);
      window.location.href = data.whatsappUrl;
      return;
    }

    setStatus(data?.error || 'Order failed. Please try again.');
  }

  return (
    <section className="section cartPage">
      <div className="container cart">
        <div className="cartHeader">
          <span className="cartEyebrow">{copy.cartEyebrow}</span>
          <h1>{copy.cartTitle}</h1>
          <p>{copy.cartIntro}</p>
          {items.length ? (
            <div className="cartStats" aria-label="Cart summary">
              <span>
                {items.length} design{items.length === 1 ? '' : 's'}
              </span>
              <span>
                {count} piece{count === 1 ? '' : 's'}
              </span>
            </div>
          ) : null}
        </div>

        {items.length ? (
          <div className="cartLayout">
            <div className="cartItemsPanel">
              <div className="cartPanelHead">
                <div>
                  <span className="cartEyebrow">Selected pieces</span>
                  <h2>Ready for checkout</h2>
                </div>
                <button className="cartClearBtn" type="button" onClick={clear}>
                  Clear cart
                </button>
              </div>

              <div className="cartList">
                {items.map((item, index) => {
                  const lineTotal =
                    Number(item.price || 0) * Number(item.qty || 0);

                  return (
                    <article
                      key={`${item.id}-${item.size}-${item.color}-${item.material}-${index}`}
                      className="cartRow"
                    >
                      <div className="cartImg">
                        {item.image ? (
                          <img src={item.image} alt={item.title} />
                        ) : null}
                      </div>
                      <div className="cartInfo">
                        <div className="cartRowTop">
                          <div>
                            <h3 className="cartTitle">{item.title}</h3>
                            {item.size || item.color || item.material ? (
                              <div className="cartMeta">
                                {item.size ? (
                                  <span>Size: {item.size}</span>
                                ) : null}
                                {item.color ? (
                                  <span>Color: {item.color}</span>
                                ) : null}
                                {item.material ? (
                                  <span>Material: {item.material}</span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          <div className="cartLineTotal">
                            <span>Line total</span>
                            <strong>
                              {currency} {lineTotal}
                            </strong>
                          </div>
                        </div>

                        <div className="cartRowBottom">
                          <div className="cartUnitPrice">
                            {currency} {item.price} each
                          </div>
                          <div className="cartControls">
                            <div className="cartQtyControl">
                              <button
                                type="button"
                                aria-label={`Decrease quantity for ${item.title}`}
                                disabled={Number(item.qty || 1) <= 1}
                                onClick={() =>
                                  setQty(index, Number(item.qty || 1) - 1)
                                }
                              >
                                -
                              </button>
                              <input
                                className="qty"
                                type="number"
                                min={1}
                                aria-label={`Quantity for ${item.title}`}
                                value={item.qty}
                                onChange={(event) =>
                                  setQty(index, Number(event.target.value || 1))
                                }
                              />
                              <button
                                type="button"
                                aria-label={`Increase quantity for ${item.title}`}
                                onClick={() =>
                                  setQty(index, Number(item.qty || 1) + 1)
                                }
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="cartRemoveBtn"
                              type="button"
                              onClick={() => removeItem(index)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="cartCheckout">
              <div className="panel cartSummaryPanel">
                <span className="cartEyebrow">Checkout details</span>
                <h2>Send order on WhatsApp</h2>
                <p className="cartSummaryText">
                  Your order will open in WhatsApp after the details are
                  confirmed.
                </p>

                <form className="form cartForm" onSubmit={handleCheckout}>
                  <label className="fieldLabel">
                    <span>Full Name</span>
                    <input className="input" name="customerName" required />
                  </label>
                  <label className="fieldLabel">
                    <span>Phone</span>
                    <input className="input" name="phone" required />
                  </label>
                  <label className="fieldLabel">
                    <span>Address</span>
                    <textarea
                      className="input"
                      name="address"
                      rows={3}
                      required
                    />
                  </label>
                  <label className="fieldLabel">
                    <span>Notes</span>
                    <textarea className="input" name="notes" rows={2} />
                  </label>

                  <div className="couponPanel">
                    <div>
                      <strong>Discount code</strong>
                      <span>Apply a valid code before checkout.</span>
                    </div>
                    <div className="couponBox">
                      <input
                        className="input"
                        placeholder="Discount code"
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                      />
                      <button
                        className="btn btn--ghost"
                        type="button"
                        onClick={applyCoupon}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {status ? <div className="couponMeta">{status}</div> : null}

                  <div className="totalBlock">
                    <div className="totalRow">
                      <span>Subtotal</span>
                      <strong>
                        {currency} {subtotal}
                      </strong>
                    </div>

                    {appliedDiscount ? (
                      <div className="totalRow discountRow">
                        <span>Discount</span>
                        <strong>
                          - {currency} {appliedDiscount.discount}
                        </strong>
                      </div>
                    ) : null}

                    <div className="totalRow finalRow">
                      <span>Total</span>
                      <strong>
                        {currency} {total}
                      </strong>
                    </div>
                  </div>

                  <button
                    className="btn btn--primary btn--block"
                    type="submit"
                    disabled={!items.length}
                  >
                    Place Order on WhatsApp
                  </button>
                </form>
              </div>
            </aside>
          </div>
        ) : (
          <div className="cartEmpty">
            <span className="cartEyebrow">Cart is empty</span>
            <h2>{copy.cartEmptyTitle}</h2>
            <p className="muted">{copy.cartEmptyText}</p>
            <a className="btn btn--primary" href="/shop">
              Go shopping
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
