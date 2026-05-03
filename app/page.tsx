import Link from 'next/link';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { HomeScrollAnimations } from '@/components/home-scroll-animations';
import { isProductInStock } from '@/lib/product-stock';
import { getHomeData, getStoreContext } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

function formatPrice(currency: string, price: number) {
  return `${currency} ${Number(price || 0).toLocaleString('en-PK')}`;
}

export default async function HomePage() {
  const [home, store] = await Promise.all([getHomeData(), getStoreContext()]);
  const assetBase = '/uploads/hyderabadi-churiyan-elements';
  const iconBase = '/uploads/hyderabadi-churiyan-icons';

  const gallery = (
    home.settings.galleryImages?.length
      ? home.settings.galleryImages
      : home.featured.slice(0, 6).map((product) => product.image)
  )
    .filter(Boolean)
    .slice(0, 6);

  const bestSellers = [...home.bestSellers, ...home.featured]
    .filter(
      (product, index, all) =>
        product && all.findIndex((item) => item.id === product.id) === index,
    )
    .slice(0, 5);

  const heroProduct = home.featured[5] || home.featured[0];
  const storyProduct = home.featured[3] || home.featured[1] || home.featured[0];
  const heroImage = home.settings.heroImage || heroProduct?.image || gallery[0];
  const storyImage = storyProduct?.image || gallery[3] || gallery[0];

  const collectionCards = [
    {
      category: 'Bridal Bangles',
      title: 'Bridal',
      image: `${assetBase}/bridal_jewelry_collection_in_neon_glow.png`,
    },
    {
      category: 'Chooriyan Sets',
      title: 'Festive',
      image: `${assetBase}/elegant_jewel_toned_bangle_collection_display.png`,
    },
    {
      category: 'Custom Bangles',
      title: 'Everyday',
      image: `${assetBase}/luxurious_bangle_display_with_golden_accents.png`,
    },
    {
      category: 'Head Accessories',
      title: 'Statement',
      image: `${assetBase}/ornate_bangle_ad_with_glowing_accents.png`,
    },
  ];

  const promises = [
    {
      title: 'Handcrafted',
      text: 'Made with love',
      tone: 'yellow',
      icon: 'hand-love-yellow.png',
    },
    {
      title: 'Locally Inspired',
      text: 'Rooted in Hyderabad',
      tone: 'pink',
      icon: 'charminar-pink.png',
    },
    {
      title: 'Premium Quality',
      text: 'Made to last',
      tone: 'cyan',
      icon: 'diamond-cyan.png',
    },
    {
      title: 'Nationwide Delivery',
      text: 'Across Pakistan',
      tone: 'orange',
      icon: 'delivery-orange.png',
    },
  ];

  const whyChoose = [
    { text: 'Unique designs for every you', icon: 'bangle-pink.png' },
    { text: 'Premium materials with finest quality', icon: 'diamond-cyan.png' },
    { text: 'Secure packaging, safe and elegant', icon: 'gift-yellow.png' },
    { text: 'Easy returns with hassle-free support', icon: 'returns-pink.png' },
    { text: 'Happy customers, our biggest pride', icon: 'people-yellow.png' },
  ];
  const trustItems = [
    { title: 'Premium Materials', icon: 'diamond-cyan.png' },
    { title: 'Secure Packaging', icon: 'gift-yellow.png' },
    { title: 'Easy Returns', icon: 'returns-pink.png' },
    { title: 'Happy Customers', icon: 'people-yellow.png' },
  ];
  const promoBannerEnabled = home.settings.saleBannerEnabled !== false;
  const promoBannerTitle =
    home.settings.saleBannerTitle || 'First Order Special';
  const promoBannerDiscount = home.settings.saleBannerDiscountText || '20% Off';
  const promoBannerText = home.settings.saleBannerText || 'On Your First Order';
  const promoBannerCode =
    home.settings.saleBannerButtonText || 'Use Code: HYD20';

  return (
    <div className="neonHome">
      <HomeScrollAnimations />
      <section className="neonHero">
        <div className="container neonHero__grid">
          <div className="neonHero__copy">
            <p className="neonHero__kicker">Hyderabadi Churiyan</p>
            <h1>
              <span className="neonScript neonScript--yellow">Har Rang.</span>
              <span className="neonScript neonScript--cyan">Har Andaaz.</span>
              <span className="neonScript neonScript--pink">
                Bilkul Tumhare Liye.
              </span>
            </h1>
            <p className="neonHero__lead">
              Handcrafted bangles inspired by tradition, designed for every
              moment.
            </p>

            <div className="neonHero__actions">
              <Link className="neonPaintButton" href="/shop">
                Shop Now
              </Link>
              <Link className="neonOutlineButton" href="#collections">
                Explore Collections
              </Link>
            </div>
          </div>

          <div className="neonHero__visual" aria-label="Featured bangles">
            <span className="neonStroke neonStroke--pink" />
            <span className="neonStroke neonStroke--cyan" />
            <span className="neonStroke neonStroke--yellow" />
            {heroImage ? (
              <img src={heroImage} alt="Colorful handcrafted bangles" />
            ) : null}
            <div className="neonHero__badge">
              Custom bridal, festive and everyday sets
            </div>
          </div>
        </div>
      </section>

      <section className="container neonPromiseStrip" aria-label="Store values">
        {promises.map((promise) => (
          <article
            className={`neonPromise neonPromise--${promise.tone}`}
            key={promise.title}
          >
            <span className="neonPromise__icon" aria-hidden="true">
              <img src={`${iconBase}/${promise.icon}`} alt="" />
            </span>
            <div>
              <h2>{promise.title}</h2>
              <p>{promise.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="container neonSection" id="collections">
        <div className="neonSectionHead">
          <span />
          <h2>Shop By Collection</h2>
          <span />
        </div>

        <div className="neonCollectionGrid">
          {collectionCards.map((card) => (
            <Link
              className="neonCollectionCard neonCollectionCard--asset"
              href={`/shop?category=${encodeURIComponent(card.category)}`}
              key={card.category}
            >
              <img src={card.image} alt={`${card.title} collection`} />
            </Link>
          ))}
        </div>
      </section>

      <section className="container neonSection" id="best-sellers">
        <div className="neonSectionHead">
          <span />
          <h2>Best Sellers</h2>
          <span />
        </div>

        <div className="neonProductRail">
          {bestSellers.map((product, index) => {
            const inStock = isProductInStock(product);

            return (
              <article className="neonProductCard" key={product.id}>
                <Link
                  className="neonProductCard__media"
                  href={`/product/${product.id}`}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
                <span className="neonProductCard__tag">
                  <img
                    src={`${iconBase}/${
                      index % 2 === 0 ? 'fire-yellow.png' : 'spark-gold.png'
                    }`}
                    alt=""
                  />
                  {index % 2 === 0 ? 'Trending' : 'New'}
                </span>
                <span className="neonProductWishlistIcon" aria-hidden="true">
                  <img src={`${iconBase}/heart-pink.png`} alt="" />
                </span>
                <Link href={`/product/${product.id}`}>
                  <h3>{product.title}</h3>
                </Link>
                <p className="neonPrice">
                  {formatPrice(store.currency, product.price)}
                </p>
                <AddToCartButton
                  className="neonAddCart"
                  disabled={!inStock}
                  item={{
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                  }}
                >
                  {inStock ? (
                    <>
                      <img src={`${iconBase}/cart-pink.png`} alt="" />
                      Add To Cart
                    </>
                  ) : (
                    'Out Of Stock'
                  )}
                </AddToCartButton>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container neonStory" id="story">
        <div className="neonStory__image">
          {storyImage ? (
            <img
              src={storyImage}
              alt="Hyderabadi Churiyan handcrafted story"
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </div>
        <div className="neonStory__copy">
          <p className="neonMiniTitle">Our Story</p>
          <h2>
            <span>From the lanes of</span>
            <span>Hyderabad to your heart.</span>
          </h2>
          <p>
            Every bangle holds a story of culture, craftsmanship, and the women
            who inspire us every day. Hyderabadi Churiyan is more than jewelry;
            it is a celebration of roots, color, and custom pieces made with
            pride.
          </p>
          <Link className="neonOutlineButton" href="/contact">
            Know Our Story
          </Link>
        </div>
        <div className="neonStory__art" aria-hidden="true">
          <img src={store.storeLogo} alt="" loading="lazy" decoding="async" />
        </div>
      </section>

      <section className="container neonTrustStrip" aria-label="More benefits">
        {trustItems.map((item) => (
          <div key={item.title}>
            <span>
              <img src={`${iconBase}/${item.icon}`} alt="" />
            </span>
            <strong>{item.title}</strong>
          </div>
        ))}
      </section>

      <section
        className="container neonSection neonInstaSection"
        id="insta-love"
      >
        <div className="neonSectionHead">
          <span />
          <h2>Insta Love</h2>
          <span />
        </div>
        <p className="neonCenterText">
          Tag us to get featured #{store.storeName.replace(/\s+/g, '')}
        </p>

        <div className="neonInstaGrid">
          {gallery.map((image, index) => (
            <Link
              className="neonInstaCard"
              href="/shop"
              key={`${image}-${index}`}
            >
              <img
                src={image}
                alt={`${store.storeName} gallery ${index + 1}`}
                loading="lazy"
                decoding="async"
              />
            </Link>
          ))}
        </div>

        <Link className="neonFollowButton" href="/contact">
          Follow Us @{store.instagramHandle}
        </Link>
      </section>

      {promoBannerEnabled ? (
        <section className="container neonOfferBanner">
          <img
            className="neonOfferBanner__icon neonOfferBanner__icon--left"
            src={`${iconBase}/bangle-pink.png`}
            alt=""
          />
          <span>{promoBannerTitle}</span>
          <strong>{promoBannerDiscount}</strong>
          <span>{promoBannerText}</span>
          <mark>{promoBannerCode}</mark>
          <img
            className="neonOfferBanner__icon neonOfferBanner__icon--right"
            src={`${iconBase}/fire-yellow.png`}
            alt=""
          />
        </section>
      ) : null}

      <section className="container neonWhy">
        <div className="neonSectionHead">
          <span />
          <h2>Why Choose Us</h2>
          <span />
        </div>
        <div className="neonWhy__grid">
          {whyChoose.map((item) => (
            <article key={item.text}>
              <span>
                <img src={`${iconBase}/${item.icon}`} alt="" />
              </span>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
