'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { SaleBanner } from '@/lib/storefront';
import { useCart } from './cart-context';

type SiteShellProps = {
  storeName: string;
  storeLogo: string;
  announcementBarEnabled: boolean;
  announcementBarText: string;
  saleBanner: SaleBanner;
  footerText: string;
  year: number;
  children: React.ReactNode;
};

function getRemainingTime(endAt: string, nowIso: string) {
  const end = new Date(endAt).getTime();
  const serverNow = new Date(nowIso).getTime();
  const clientStart = Date.now();

  return () => {
    const elapsed = Date.now() - clientStart;
    const diff = Math.max(0, end - (serverNow + elapsed));

    const totalSeconds = Math.floor(diff / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      '0',
    );
    const seconds = String(totalSeconds % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };
}

export function SiteShell({
  storeName,
  storeLogo,
  announcementBarEnabled,
  announcementBarText,
  saleBanner,
  footerText,
  year,
  children,
}: SiteShellProps) {
  const pathname = usePathname();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [timerValue, setTimerValue] = useState('--:--:--');

  useEffect(() => {
    if (
      !saleBanner?.timerEnabled ||
      !saleBanner?.endAt ||
      !saleBanner?.nowIso
    ) {
      return;
    }

    const compute = getRemainingTime(saleBanner.endAt, saleBanner.nowIso);
    setTimerValue(compute());

    const timer = window.setInterval(() => {
      setTimerValue(compute());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [saleBanner]);

  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
      {announcementBarEnabled && announcementBarText ? (
        <div className="announcementBar">
          <div className="container announcementBar__inner">
            <div
              className="announcementTicker"
              aria-label={announcementBarText}
            >
              <div className="announcementTicker__track">
                <span>{announcementBarText}</span>
                <span>{announcementBarText}</span>
                <span>{announcementBarText}</span>
                <span>{announcementBarText}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {saleBanner?.active ? (
        <div className="siteSaleBanner">
          <div className="container siteSaleBanner__inner">
            <div className="siteSaleBanner__copy">
              <strong>{saleBanner.title || 'Sale Live'}</strong>
              {saleBanner.percent ? (
                <span className="siteSaleBanner__percent">
                  -{saleBanner.percent}%
                </span>
              ) : null}
              {saleBanner.text ? (
                <span className="siteSaleBanner__text">{saleBanner.text}</span>
              ) : null}
            </div>

            {saleBanner.timerEnabled && saleBanner.endAt ? (
              <div className="siteSaleBanner__timer">
                <span>Ends in</span>
                <strong>{timerValue}</strong>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <nav className="nav">
        <div className="container nav__inner">
          <div className="nav__topRow">
            <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
              {storeLogo ? (
                <img className="brand__logo" src={storeLogo} alt={storeName} />
              ) : (
                <span className="brand__dot" />
              )}
              <span>{storeName}</span>
            </Link>

            <button
              className={`mobileMenuToggle${menuOpen ? ' is-open' : ''}`}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobileMenu"
              onClick={() => setMenuOpen((current) => !current)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <div
            className={`nav__links${menuOpen ? ' is-open' : ''}`}
            id="mobileMenu"
          >
            <Link href="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link
              href="/shop?category=Bridal%20Bangles"
              onClick={() => setMenuOpen(false)}
            >
              Bangles
            </Link>
            <Link
              href="/shop?category=Custom%20Bangles"
              onClick={() => setMenuOpen(false)}
            >
              Custom Bangles
            </Link>
            <Link
              href="/shop?category=Necklaces"
              onClick={() => setMenuOpen(false)}
            >
              Necklaces
            </Link>
            <Link
              href="/shop?category=Earrings"
              onClick={() => setMenuOpen(false)}
            >
              Earrings
            </Link>
            <Link
              href="/shop?category=Head%20Accessories"
              onClick={() => setMenuOpen(false)}
            >
              Head Accessories
            </Link>
            <Link href="/wishlist" onClick={() => setMenuOpen(false)}>
              Wishlist
            </Link>
            <Link href="/track-order" onClick={() => setMenuOpen(false)}>
              Track Order
            </Link>
            <Link href="/cart" onClick={() => setMenuOpen(false)}>
              Cart
              <span className="cartBadge">{count}</span>
            </Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="footer">
        <div className="container footer__inner">
          <div>
            <div className="brand brand--footer">
              {storeLogo ? (
                <img className="brand__logo" src={storeLogo} alt={storeName} />
              ) : (
                <span className="brand__dot" />
              )}
              <span>{storeName}</span>
            </div>
            <p className="muted">{footerText}</p>
          </div>

          <div className="footer__links">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className="container footerMeta">
          Copyright {year} {storeName}
        </div>
      </footer>
    </>
  );
}
