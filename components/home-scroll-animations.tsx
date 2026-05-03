'use client';

import { useEffect } from 'react';

const revealSelectors = [
  '.neonHero__copy > *',
  '.neonHero__visual',
  '.neonPromise',
  '.neonSectionHead',
  '.neonCollectionCard',
  '.neonProductCard',
  '.neonStory',
  '.neonTrustStrip',
  '.neonInstaCard',
  '.neonFollowButton',
  '.neonOfferBanner',
  '.neonWhy__grid article',
].join(',');

export function HomeScrollAnimations() {
  useEffect(() => {
    const home = document.querySelector<HTMLElement>('.neonHome');

    if (
      !home ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const elements = Array.from(
      home.querySelectorAll<HTMLElement>(revealSelectors),
    );

    home.dataset.scrollRevealReady = 'true';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.14,
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      delete home.dataset.scrollRevealReady;
    };
  }, []);

  return null;
}
