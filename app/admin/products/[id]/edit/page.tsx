import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminProductForm } from '@/components/admin-product-form';
import { buildProductCatalog } from '@/lib/admin-catalog';
import type { ProductRecord } from '@/lib/storefront';
import { Storage } from '@/src/storage/storage.adapter';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, products] = (await Promise.all([
    Storage.getProductById(id),
    Storage.listProducts({ includeHidden: true }),
  ])) as [ProductRecord | null, ProductRecord[]];

  if (!product) {
    notFound();
  }

  const catalog = buildProductCatalog(products);

  return (
    <section className="adminPage">
      <div className="container">
        <div className="adminSectionHead">
          <div>
            <span className="adminKicker">Catalog</span>
            <h1>Edit Product</h1>
            <p>{product.title}</p>
          </div>
          <div className="adminActions">
            <Link className="btn btn--ghost" href={`/product/${product.id}`}>
              View Product
            </Link>
            <Link className="btn btn--ghost" href="/admin/products">
              Back to Products
            </Link>
          </div>
        </div>

        <section className="adminPanelCard">
          <AdminProductForm mode="edit" product={product} catalog={catalog} />
        </section>
      </div>
    </section>
  );
}
