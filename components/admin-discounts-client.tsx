'use client';

import { FormEvent, useEffect, useState } from 'react';

type Discount = {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  isActive: boolean;
};

export function AdminDiscountsClient() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [status, setStatus] = useState('');

  async function load() {
    const response = await fetch('/api/admin/discounts', { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      setStatus(data.error || 'Could not load discounts.');
      return;
    }

    setDiscounts(data.discounts || []);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: String(form.get('code') || ''),
        type: String(form.get('type') || 'percent'),
        value: Number(form.get('value') || 0),
        isActive: form.get('isActive') === 'on',
      }),
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      setStatus(data.error || 'Could not save discount.');
      return;
    }

    event.currentTarget.reset();
    setStatus('Discount saved.');
    await load();
  }

  async function remove(code: string) {
    const response = await fetch(
      `/api/admin/discounts/${encodeURIComponent(code)}`,
      {
        method: 'DELETE',
      },
    );
    const data = await response.json();

    if (!response.ok || !data.ok) {
      setStatus(data.error || 'Could not delete discount.');
      return;
    }

    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="adminPage">
      <div className="container">
        <div className="adminSectionHead">
          <div>
            <span className="adminKicker">Promotions</span>
            <h1>Discounts</h1>
            <p>Discount codes connect directly to the cart checkout.</p>
          </div>
        </div>

        {status ? <div className="adminAlert">{status}</div> : null}

        <div className="adminTwoColumn">
          <section className="adminPanelCard">
            <div className="adminPanelCard__head">
              <div>
                <span className="adminKicker">Create</span>
                <h2>Discount Code</h2>
              </div>
            </div>
            <form className="adminForm" onSubmit={save}>
              <label>
                Code
                <input className="adminInput" name="code" required />
              </label>
              <label>
                Type
                <select
                  className="adminInput"
                  name="type"
                  defaultValue="percent"
                >
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </label>
              <label>
                Value
                <input
                  className="adminInput"
                  name="value"
                  type="number"
                  required
                />
              </label>
              <label className="adminCheckField">
                <input name="isActive" type="checkbox" defaultChecked />
                Active
              </label>
              <button className="btn btn--primary" type="submit">
                Save Discount
              </button>
            </form>
          </section>

          <section className="adminPanelCard">
            <div className="adminPanelCard__head">
              <div>
                <span className="adminKicker">Active List</span>
                <h2>Codes</h2>
              </div>
            </div>
            <div className="adminMiniList">
              {discounts.map((discount) => (
                <div className="adminMiniRow" key={discount.code}>
                  <div>
                    <strong>{discount.code}</strong>
                    <span>
                      {discount.type} - {discount.value}
                    </span>
                  </div>
                  <div className="adminActions">
                    <span
                      className={`adminBadge ${discount.isActive ? 'adminBadge--active' : ''}`}
                    >
                      {discount.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      className="btn btn--danger btn--small"
                      type="button"
                      onClick={() => remove(discount.code)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {!discounts.length ? (
                <p className="adminMuted">No discount codes yet.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
