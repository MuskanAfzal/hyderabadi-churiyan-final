import Link from 'next/link';
import { AdminProductForm } from '@/components/admin-product-form';
import { buildProductCatalog } from '@/lib/admin-catalog';
import type { ProductRecord } from '@/lib/storefront';
import { Storage } from '@/src/storage/storage.adapter';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const products = (await Storage.listProducts({
    includeHidden: true,
  })) as ProductRecord[];
  const catalog = buildProductCatalog(products);

  return (
    <section className="adminPage">
      <div className="container">
        <div className="adminSectionHead">
          <div>
            <span className="adminKicker">Catalog</span>
            <h1>New Product</h1>
            <p>
              Create a product that appears in the shop and can be added to
              cart.
            </p>
          </div>
          <Link className="btn btn--ghost" href="/admin/products">
            Back to Products
          </Link>
        </div>

        <section className="adminPanelCard">
          <AdminProductForm mode="create" catalog={catalog} />
        </section>
      </div>
    </section>
  );
}
