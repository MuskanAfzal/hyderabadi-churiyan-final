import { FileDB } from './filedb';

import { preferDatabase } from './data-backend';
import { query } from './postgres';

export type StoreSettings = {
  storeName: string;
  storeLogo: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  ownerWhatsapp: string;
  currency: string;
  instagramHandle: string;
  announcementBarEnabled: boolean;
  announcementBarText: string;
  saleBannerEnabled: boolean;
  saleBannerTitle: string;
  saleBannerText: string;
  saleBannerButtonText: string;
  emailPopupEnabled: boolean;
  emailPopupTitle: string;
  emailPopupText: string;
  testimonials: Array<{
    quote: string;
    name: string;
    role: string;
  }>;
  galleryImages: string[];
  siteCopy: SiteCopy;
};

export type SiteCopy = {
  homeCategoryTitle: string;
  homeFeaturePrimaryTitle: string;
  homeFeaturePrimaryCta: string;
  homeFeatureSecondaryTitle: string;
  homeFeatureSecondaryCta: string;
  homeShowcaseKicker: string;
  homeShowcaseTitle: string;
  homeShowcaseLink: string;
  customStoryKicker: string;
  customStoryTitle: string;
  customStoryText: string;
  customStoryButton: string;
  completeLookTitle: string;
  instagramTitle: string;
  shopKicker: string;
  shopTitleFallback: string;
  shopIntro: string;
  shopPrimaryButton: string;
  shopSecondaryButton: string;
  footerText: string;
  contactTitle: string;
  contactIntro: string;
  cartEyebrow: string;
  cartTitle: string;
  cartIntro: string;
  cartEmptyTitle: string;
  cartEmptyText: string;
};

const defaultSiteCopy: SiteCopy = {
  homeCategoryTitle: 'Shop by Category',
  homeFeaturePrimaryTitle: 'Personalized Bridal Bangles',
  homeFeaturePrimaryCta: 'Shop Now',
  homeFeatureSecondaryTitle: 'Signature Kalira and Accessories',
  homeFeatureSecondaryCta: 'See the Collection',
  homeShowcaseKicker: 'Signature Work',
  homeShowcaseTitle: 'Hand-finished pieces made around your celebration',
  homeShowcaseLink: 'View all designs',
  customStoryKicker: 'Custom Churiyan',
  customStoryTitle:
    'Personal details, colors, initials and finishes chosen for your outfit',
  customStoryText:
    'Share your dress color and occasion, then choose the finish: traditional red, soft bridal white, maroon-gold, yellow-mehndi, or a completely personal palette.',
  customStoryButton: 'Explore Custom Bangles',
  completeLookTitle: 'Complete the Look',
  instagramTitle: 'Latest from Hyderabadi Churiyan',
  shopKicker: 'Hyderabadi Churiyan',
  shopTitleFallback: 'Custom Bangles Atelier',
  shopIntro:
    'Custom bangles, bridal stacks, kaleeras and accessories styled like a private festive edit.',
  shopPrimaryButton: 'Custom Bangles',
  shopSecondaryButton: 'Bridal Sets',
  footerText:
    'Custom Hyderabadi churiyan, bridal bangles, kaleeras, earrings, necklaces, and head accessories.',
  contactTitle: 'Contact',
  contactIntro: 'Chat with the owner directly on WhatsApp.',
  cartEyebrow: 'WhatsApp checkout',
  cartTitle: 'Your Cart',
  cartIntro:
    'Review your selected pieces, add your delivery details, and send the order directly to the owner.',
  cartEmptyTitle: 'Start a festive stack',
  cartEmptyText:
    'Browse custom churiyan, bridal sets, kaleeras, earrings, necklaces, and head accessories.',
};

const defaults: StoreSettings = {
  storeName: 'MiniStore',
  storeLogo: '',
  heroTitle: 'Timeless jewellery & refined fashion for every occasion.',
  heroSubtitle:
    'Discover elegant essentials, curated collections, and statement styles designed to elevate your everyday look.',
  heroImage: '',
  ownerWhatsapp: '',
  currency: 'PKR',
  instagramHandle: 'ministore',
  announcementBarEnabled: true,
  announcementBarText: 'Free delivery on orders above PKR 5000',
  saleBannerEnabled: true,
  saleBannerTitle: '30% OFF SALE',
  saleBannerText: 'Limited-time offers on selected favourites.',
  saleBannerButtonText: 'Shop the Sale',
  emailPopupEnabled: true,
  emailPopupTitle: 'Subscribe for 10% discount',
  emailPopupText: 'Be the first to hear about new drops and limited offers.',
  testimonials: [
    {
      quote:
        'The packaging, finishing, and quality felt so premium. My order looked far more expensive than it was.',
      name: 'Sarah K.',
      role: 'Repeat Customer',
    },
    {
      quote:
        'I ordered for an event and the pieces matched perfectly with my outfit. Elegant, classy, and exactly what I wanted.',
      name: 'Hina A.',
      role: 'Occasion Wear Buyer',
    },
    {
      quote:
        'Fast WhatsApp support and beautiful quality. This shop feels personal and luxurious at the same time.',
      name: 'Zara M.',
      role: 'Fashion Buyer',
    },
  ],
  galleryImages: [],
  siteCopy: defaultSiteCopy,
};

export class SettingsService {
  private db = new FileDB<StoreSettings>('data/settings.json', defaults);

  private normalize(input: Partial<StoreSettings> = {}) {
    const s = input as StoreSettings;
    return {
      ...defaults,
      ...s,
      testimonials:
        Array.isArray(s.testimonials) && s.testimonials.length
          ? s.testimonials
          : defaults.testimonials,
      galleryImages: Array.isArray(s.galleryImages)
        ? s.galleryImages
        : defaults.galleryImages,
      siteCopy: {
        ...defaultSiteCopy,
        ...(s.siteCopy || {}),
      },
    };
  }

  get() {
    return this.normalize(this.db.read());
  }

  async getAsync() {
    if (preferDatabase()) {
      try {
        const { rows } = await query<{ data: Partial<StoreSettings> }>(
          `select data from settings where id = 1 limit 1`,
        );

        if (rows[0]?.data) {
          return this.normalize(rows[0].data);
        }
      } catch {
        // Local JSON remains the fallback for development/offline use.
      }
    }

    return this.get();
  }

  update(patch: Partial<StoreSettings>) {
    const current = this.get();
    const next = {
      ...current,
      ...patch,
      testimonials: patch.testimonials || current.testimonials,
      galleryImages: patch.galleryImages || current.galleryImages,
      siteCopy: {
        ...current.siteCopy,
        ...(patch.siteCopy || {}),
      },
    };
    this.db.write(next);
    return next;
  }

  async updateAsync(patch: Partial<StoreSettings>) {
    const current = await this.getAsync();
    const next = this.normalize({
      ...current,
      ...patch,
      testimonials: patch.testimonials || current.testimonials,
      galleryImages: patch.galleryImages || current.galleryImages,
      siteCopy: {
        ...current.siteCopy,
        ...(patch.siteCopy || {}),
      },
    });

    if (preferDatabase()) {
      try {
        await query(
          `
          insert into settings (id, data)
          values (1, $1::jsonb)
          on conflict (id) do update
          set data = excluded.data
          `,
          [JSON.stringify(next)],
        );
      } catch {
        // Local JSON remains the fallback for development/offline use.
      }
    }

    this.db.write(next);
    return next;
  }
}
