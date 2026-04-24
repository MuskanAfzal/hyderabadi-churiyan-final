import { CartPageClient } from '@/components/cart-page-client';
import { getStoreContext } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const store = await getStoreContext();
  return (
    <CartPageClient currency={store.currency} copy={store.settings.siteCopy} />
  );
}
