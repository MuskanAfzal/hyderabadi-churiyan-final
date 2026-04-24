import { findOrderById } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const orderId = getValue(params.orderId) || '';
  const result = orderId ? await findOrderById(orderId) : null;

  return (
    <section className="section">
      <div className="container contact">
        <div className="contactCard">
          <h1>Track Order</h1>
          <p className="muted">
            Enter your order ID to check the latest status.
          </p>

          <form
            method="GET"
            action="/track-order"
            className="form"
            style={{ marginTop: 18 }}
          >
            <input
              className="input"
              name="orderId"
              placeholder="Enter order ID"
              defaultValue={orderId}
              required
            />
            <button className="btn btn--primary" type="submit">
              Track Order
            </button>
          </form>

          {result ? (
            <>
              <div className="divider" />
              <div className="contactBox">
                <div>
                  <div className="label">Order ID</div>
                  <div className="value">{result.id}</div>
                </div>
                <div>
                  <div className="label">Status</div>
                  <div className="value">{result.status || 'New'}</div>
                </div>
              </div>

              <div className="panel" style={{ marginTop: 18 }}>
                <div className="label">Customer</div>
                <p>{result.customerName}</p>

                <div className="label">Items</div>
                <ul className="trackResultsList">
                  {result.items.map((item, index) => (
                    <li key={`${item.id}-${index}`}>
                      {item.title} x{item.qty}
                    </li>
                  ))}
                </ul>

                <div className="label">Total</div>
                <p>
                  {result.currency || 'PKR'} {result.total}
                </p>
              </div>
            </>
          ) : orderId ? (
            <div
              className="shopNoResults"
              style={{ display: 'block', marginTop: 18 }}
            >
              <p className="muted">No order found for that ID.</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
