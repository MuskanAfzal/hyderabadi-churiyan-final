'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { SaleRulesEditor } from './admin-repeatable-fields';

type SalesConfig = {
  globalEnabled: boolean;
  globalPercent: number;
  globalTimerEnabled: boolean;
  globalStartAt: string;
  globalEndAt: string;
  categoryRules: Record<string, number>;
  productRules: Record<string, number>;
};

type PreviewRow = {
  id: string;
  title: string;
  category: string;
  originalPrice: number;
  finalPrice: number;
  salePercent: number;
  onSale: boolean;
  saleSource: string;
};

export function AdminSalesClient() {
  const [sales, setSales] = useState<SalesConfig | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [status, setStatus] = useState('');

  const categoryOptions = useMemo(() => {
    const categories = new Map<string, string>();

    preview.forEach((product) => {
      const category = String(product.category || '').trim();
      if (category) categories.set(category.toLowerCase(), category);
    });

    Object.keys(sales?.categoryRules || {}).forEach((category) => {
      if (category) categories.set(category.toLowerCase(), category);
    });

    return Array.from(categories.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [preview, sales?.categoryRules]);

  const productOptions = useMemo(() => {
    const products = new Map<string, string>();

    preview.forEach((product) => {
      const id = String(product.id || '').trim();
      if (id) products.set(id, product.title || id);
    });

    Object.keys(sales?.productRules || {}).forEach((id) => {
      if (id && !products.has(id)) products.set(id, id);
    });

    return Array.from(products.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [preview, sales?.productRules]);

  async function load() {
    const response = await fetch('/api/admin/sales', { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      setStatus(data.error || 'Could not load sale settings.');
      return;
    }

    setSales(data.sales);
    setPreview(data.preview || []);
  }

  function patchSales<K extends keyof SalesConfig>(
    key: K,
    value: SalesConfig[K],
  ) {
    setSales((current) => (current ? { ...current, [key]: value } : current));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sales) return;

    const response = await fetch('/api/admin/sales', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sales),
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      setStatus(data.error || 'Could not save sale settings.');
      return;
    }

    setStatus('Sale settings saved.');
    setSales(data.sales);
    setPreview(data.preview || []);
  }

  useEffect(() => {
    void load();
  }, []);

  if (!sales) {
    return (
      <section className="adminPage">
        <div className="container adminPanelCard">Loading sale settings...</div>
      </section>
    );
  }

  return (
    <section className="adminPage">
      <div className="container">
        <div className="adminSectionHead">
          <div>
            <span className="adminKicker">Promotions</span>
            <h1>Sales</h1>
            <p>Control global, category, and product-level sale prices.</p>
          </div>
        </div>

        {status ? <div className="adminAlert">{status}</div> : null}

        <section className="adminPanelCard">
          <form className="adminForm" onSubmit={save}>
            <div className="adminFormGrid">
              <label className="adminCheckField">
                <input
                  type="checkbox"
                  checked={sales.globalEnabled}
                  onChange={(event) =>
                    patchSales('globalEnabled', event.target.checked)
                  }
                />
                Global sale enabled
              </label>
              <label>
                Global Percent
                <input
                  className="adminInput"
                  type="number"
                  min={0}
                  max={100}
                  value={sales.globalPercent}
                  onChange={(event) =>
                    patchSales('globalPercent', Number(event.target.value || 0))
                  }
                />
              </label>
              <label className="adminCheckField">
                <input
                  type="checkbox"
                  checked={sales.globalTimerEnabled}
                  onChange={(event) =>
                    patchSales('globalTimerEnabled', event.target.checked)
                  }
                />
                Sale timer enabled
              </label>
              <label>
                Start At
                <input
                  className="adminInput"
                  type="datetime-local"
                  value={sales.globalStartAt}
                  onChange={(event) =>
                    patchSales('globalStartAt', event.target.value)
                  }
                />
              </label>
              <label>
                End At
                <input
                  className="adminInput"
                  type="datetime-local"
                  value={sales.globalEndAt}
                  onChange={(event) =>
                    patchSales('globalEndAt', event.target.value)
                  }
                />
              </label>
              <SaleRulesEditor
                label="Category Sale Rules"
                value={sales.categoryRules}
                options={categoryOptions}
                emptyText="Set a discount for an entire category."
                onChange={(categoryRules) =>
                  patchSales('categoryRules', categoryRules)
                }
              />
              <SaleRulesEditor
                label="Product Sale Rules"
                value={sales.productRules}
                options={productOptions}
                emptyText="Set a discount for a specific product."
                onChange={(productRules) =>
                  patchSales('productRules', productRules)
                }
              />
            </div>
            <div className="adminFormActions">
              <button className="btn btn--primary" type="submit">
                Save Sales
              </button>
            </div>
          </form>
        </section>

        <section className="adminPanelCard adminPanelCard--spaced">
          <div className="adminPanelCard__head">
            <div>
              <span className="adminKicker">Preview</span>
              <h2>Sale Price Preview</h2>
            </div>
          </div>

          <div className="adminTable">
            <div className="adminTableRow adminSalesRow adminTableHead">
              <span>Product</span>
              <span>Source</span>
              <span>Sale</span>
              <span>Original</span>
              <span>Final</span>
            </div>
            {preview.slice(0, 20).map((row) => (
              <div className="adminTableRow adminSalesRow" key={row.id}>
                <span>{row.title}</span>
                <span className={`adminBadge adminBadge--${row.saleSource}`}>
                  {row.saleSource}
                </span>
                <span>{row.salePercent}%</span>
                <span>PKR {row.originalPrice}</span>
                <strong>PKR {row.finalPrice}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
