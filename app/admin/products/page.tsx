import Link from 'next/link';
import { Storage } from '@/src/storage/storage.adapter';
import type { ProductRecord } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = (await Storage.listProducts({
    includeHidden: true,
  })) as ProductRecord[];

  return (
    <section className="adminPage">
      <div className="container">
        <div className="adminSectionHead">
          <div>
            <span className="adminKicker">Catalog</span>
            <h1>Products</h1>
            <p>
              Every product here is connected to the shop, product pages, cart,
              and filters.
            </p>
          </div>
          <Link className="btn btn--primary" href="/admin/products/new">
            Add Product
          </Link>
        </div>

        <div className="adminTable">
          <div className="adminTableRow adminTableHead adminProductsRow">
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {products.map((product) => (
            <div className="adminTableRow adminProductsRow" key={product.id}>
              <div className="adminProductCell">
                <img src={product.image} alt={product.title} />
                <div>
                  <strong>{product.title}</strong>
                  <small>{product.id}</small>
                </div>
              </div>
              <span>{product.category}</span>
              <span>PKR {product.price}</span>
              <span>{product.stock ?? 'Variant based'}</span>
              <span
                className={`adminBadge adminBadge--${product.visibility || 'active'}`}
              >
                {product.visibility || 'active'}
              </span>
              <div className="adminActions">
                <Link
                  className="btn btn--ghost btn--small"
                  href={`/product/${product.id}`}
                >
                  View
                </Link>
                <Link
                  className="btn btn--primary btn--small"
                  href={`/admin/products/${product.id}/edit`}
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
