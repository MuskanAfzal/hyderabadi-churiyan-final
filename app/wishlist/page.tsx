import { WishlistPageClient } from '@/components/wishlist-page-client';
import { getStoreContext } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const store = await getStoreContext();
  return <WishlistPageClient currency={store.currency} />;
}
