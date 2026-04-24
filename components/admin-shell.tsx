'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/discounts', label: 'Discounts' },
  { href: '/admin/sales', label: 'Sales' },
  { href: '/admin/settings', label: 'Settings' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="adminChrome">
      <header className="adminTop">
        <div className="container adminTop__inner">
          <Link className="adminBrand" href="/admin">
            <span className="adminBrand__mark">HC</span>
            <span>Hyderabadi Churiyan Admin</span>
          </Link>

          <button
            className="adminMenuBtn"
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            Menu
          </button>

          <nav className={`adminNav${menuOpen ? ' is-open' : ''}`}>
            {links.map((link) => (
              <Link
                key={link.href}
                className={
                  pathname === link.href ||
                  (link.href !== '/admin' && pathname?.startsWith(link.href))
                    ? 'is-active'
                    : ''
                }
                href={link.href}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="adminTop__actions">
            <Link className="btn btn--ghost btn--small" href="/">
              View Site
            </Link>
            <button
              className="btn btn--ghost btn--small"
              type="button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="adminMain">{children}</main>

      <footer className="adminFooter">
        <div className="container adminFooter__inner">
          <span>Admin changes write directly to the live storefront data.</span>
          <Link href="/">Back to website</Link>
        </div>
      </footer>
    </div>
  );
}
