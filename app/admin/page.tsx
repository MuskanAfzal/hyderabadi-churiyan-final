import Link from 'next/link';
import { listOrders } from '@/lib/storefront';
import { DiscountsService } from '@/src/common/discounts.service';
import { SalesService } from '@/src/common/sales.service';
import { Storage } from '@/src/storage/storage.adapter';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [products, orders, discounts, sales] = await Promise.all([
    Storage.listProducts({ includeHidden: true }),
    listOrders(),
    new DiscountsService().list(),
    new SalesService().getAsync(),
  ]);
  const activeProducts = products.filter(
    (product) => product.visibility !== 'hidden',
  ).length;
  const recentOrders = orders.slice(0, 4);

  return (
    <section className="adminPage">
      <div className="container">
        <div className="adminHeroPanel">
          <div>
            <span className="adminKicker">Dashboard</span>
            <h1>Admin Dashboard</h1>
            <p>
              Manage the live storefront data, product catalog, discounts,
              sales, and order statuses from one protected area.
            </p>
          </div>
          <div className="adminHeroPanel__actions">
            <Link className="btn btn--primary" href="/admin/products/new">
              Add Product
            </Link>
            <Link className="btn btn--ghost" href="/">
              View Storefront
            </Link>
          </div>
        </div>

        <div className="adminStatsGrid">
          <div className="adminStatCard">
            <span>Total Products</span>
            <strong>{products.length}</strong>
            <small>{activeProducts} active on storefront</small>
          </div>
          <div className="adminStatCard">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
            <small>
              {orders.filter((order) => order.status === 'New').length} new
            </small>
          </div>
          <div className="adminStatCard">
            <span>Discount Codes</span>
            <strong>{discounts.length}</strong>
            <small>
              {discounts.filter((discount) => discount.isActive).length} active
            </small>
          </div>
          <div className="adminStatCard">
            <span>Global Sale</span>
            <strong>
              {sales.globalEnabled ? `${sales.globalPercent}%` : 'Off'}
            </strong>
            <small>
              {sales.globalTimerEnabled ? 'Timer enabled' : 'No timer'}
            </small>
          </div>
        </div>

        <div className="adminTwoColumn">
          <section className="adminPanelCard">
            <div className="adminPanelCard__head">
              <div>
                <span className="adminKicker">Quick Links</span>
                <h2>Store Controls</h2>
              </div>
            </div>
            <div className="adminQuickGrid">
              <Link href="/admin/products">Products</Link>
              <Link href="/admin/orders">Orders</Link>
              <Link href="/admin/discounts">Discounts</Link>
              <Link href="/admin/sales">Sales</Link>
              <Link href="/admin/settings">Website Settings</Link>
            </div>
          </section>

          <section className="adminPanelCard">
            <div className="adminPanelCard__head">
              <div>
                <span className="adminKicker">Recent Orders</span>
                <h2>Latest Activity</h2>
              </div>
              <Link className="adminTextLink" href="/admin/orders">
                View all
              </Link>
            </div>
            <div className="adminMiniList">
              {recentOrders.length ? (
                recentOrders.map((order) => (
                  <div className="adminMiniRow" key={order.id}>
                    <div>
                      <strong>{order.customerName || 'Customer'}</strong>
                      <span>{order.id}</span>
                    </div>
                    <em>
                      {order.currency || 'PKR'} {order.total}
                    </em>
                  </div>
                ))
              ) : (
                <p className="adminMuted">No orders yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
