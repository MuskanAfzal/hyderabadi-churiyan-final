import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/components/cart-context';
import { SiteShell } from '@/components/site-shell';
import { getStoreContext } from '@/lib/storefront';

export const metadata: Metadata = {
  title: 'Hyderabadi Churiyan',
  description:
    'Custom bangles, bridal churiyan, kaleeras, earrings, necklaces, and head accessories.',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await getStoreContext();

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/css/base.css" />
        <link rel="stylesheet" href="/css/home.css" />
        <link rel="stylesheet" href="/css/shop.css" />
        <link rel="stylesheet" href="/css/product.css" />
        <link rel="stylesheet" href="/css/cart.css" />
        <link rel="stylesheet" href="/css/contact.css" />
        <link rel="stylesheet" href="/css/site.css" />
        <link rel="stylesheet" href="/css/admin.css" />
      </head>
      <body>
        <CartProvider>
          <SiteShell
            storeName={store.storeName}
            storeLogo={store.storeLogo}
            announcementBarEnabled={store.announcementBarEnabled}
            announcementBarText={store.announcementBarText}
            saleBanner={store.saleBanner}
            footerText={store.settings.siteCopy.footerText}
            year={store.year}
          >
            {children}
          </SiteShell>
        </CartProvider>
      </body>
    </html>
  );
}
