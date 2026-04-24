'use client';

import { useEffect, useState } from 'react';
import type { OrderRecord } from '@/lib/storefront';

const statuses = [
  'New',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export function AdminOrdersClient() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  async function load() {
    setLoading(true);
    const response = await fetch('/api/admin/orders', { cache: 'no-store' });
    const data = await response.json();
    setLoading(false);

    if (!response.ok || !data.ok) {
      setStatus(data.error || 'Could not load orders.');
      return;
    }

    setOrders(data.orders || []);
  }

  async function updateStatus(id: string, nextStatus: string) {
    const response = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      setStatus(data.error || 'Could not update order.');
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status: nextStatus } : order,
      ),
    );
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="adminPage">
      <div className="container">
        <div className="adminSectionHead">
          <div>
            <span className="adminKicker">Orders</span>
            <h1>Orders</h1>
            <p>Review customer details and update order statuses.</p>
          </div>
          <button className="btn btn--ghost" type="button" onClick={load}>
            Refresh
          </button>
        </div>

        {status ? <div className="adminAlert">{status}</div> : null}

        <div className="adminOrdersList">
          {loading ? (
            <div className="adminPanelCard">Loading orders...</div>
          ) : null}
          {!loading && !orders.length ? (
            <div className="adminPanelCard">No orders yet.</div>
          ) : null}

          {orders.map((order) => (
            <article className="adminOrderCard" key={order.id}>
              <div className="adminOrderCard__top">
                <div>
                  <span className="adminKicker">Order</span>
                  <h2>{order.customerName || 'Customer'}</h2>
                  <p>{order.id}</p>
                </div>
                <div className="adminOrderTotal">
                  <span className={`adminBadge adminBadge--status`}>
                    {order.status || 'New'}
                  </span>
                  <strong>
                    {order.currency || 'PKR'} {order.total}
                  </strong>
                </div>
              </div>

              <div className="adminOrderGrid">
                <div>
                  <span className="adminLabel">Phone</span>
                  <p>{order.phone}</p>
                </div>
                <div>
                  <span className="adminLabel">Address</span>
                  <p>{order.address}</p>
                </div>
                <div>
                  <span className="adminLabel">Date</span>
                  <p>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="adminLabel">Notes</span>
                  <p>{order.notes || 'None'}</p>
                </div>
              </div>

              <div className="adminOrderItems">
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${item.id}-${index}`}>
                    <span>
                      {item.title} x{item.qty}
                    </span>
                    <strong>
                      {order.currency || 'PKR'}{' '}
                      {Number(item.price || 0) * Number(item.qty || 0)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="adminOrderActions">
                <select
                  className="adminInput"
                  value={order.status || 'New'}
                  onChange={(event) =>
                    updateStatus(order.id, event.target.value)
                  }
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <a
                  className="btn btn--ghost"
                  href={`https://wa.me/${String(order.phone || '').replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
