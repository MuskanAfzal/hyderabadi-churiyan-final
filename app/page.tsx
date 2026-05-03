import Link from 'next/link';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { isProductInStock } from '@/lib/product-stock';
import { getHomeData, getStoreContext } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

function formatPrice(currency: string, price: number) {
  return `${currency} ${Number(price || 0).toLocaleString('en-PK')}`;
}

export default async function HomePage() {
  const [home, store] = await Promise.all([getHomeData(), getStoreContext()]);

  const gallery = (
    home.settings.galleryImages?.length
      ? home.settings.galleryImages
      : home.featured.slice(0, 6).map((product) => product.image)
  )
    .filter(Boolean)
    .slice(0, 6);

  const heroProduct = home.featured[5] || home.featured[0];
  const storyProduct = home.featured[3] || home.featured[1] || heroProduct;
  const heroImage = home.settings.heroImage || heroProduct?.image || gallery[0];
  const storyImage = storyProduct?.image || gallery[3] || heroImage;
  const bestSellers = [...home.bestSellers, ...home.featured]
    .filter(
      (product, index, all) =>
        product && all.findIndex((item) => item.id === product.id) === index,
    )
    .slice(0, 5);

  const collectionBlueprints = [
    {
      category: 'Bridal Bangles',
      title: 'Bridal',
      label: 'Collection',
      tone: 'pink',
    },
    {
      category: 'Chooriyan Sets',
      title: 'Festive',
      label: 'Vibes',
      tone: 'cyan',
    },
    {
      category: 'Custom Bangles',
      title: 'Everyday',
      label: 'Elegance',
      tone: 'orange',
    },
    {
      category: 'Head Accessories',
      title: 'Statement',
      label: 'Pieces',
      tone: 'lime',
    },
  ];

  const collectionCards = collectionBlueprints.flatMap((blueprint, index) => {
    const collection =
      home.collections.find((item) => item.name === blueprint.category) ||
      home.collections[index];

    return collection ? [{ ...blueprint, collection }] : [];
  });

  const promises = [
    { title: 'Handcrafted', text: 'Made with love', tone: 'yellow' },
    { title: 'Locally Inspired', text: 'Rooted in Hyderabad', tone: 'pink' },
    { title: 'Premium Quality', text: 'Made to last', tone: 'cyan' },
    { title: 'Nationwide Delivery', text: 'Across Pakistan', tone: 'orange' },
  ];

  const whyChoose = [
    'Unique designs for every you',
    'Premium materials with finest quality',
    'Secure packaging, safe and elegant',
    'Easy returns with hassle-free support',
    'Happy customers, our biggest pride',
  ];

  return (
    <div className="neonHome">
      <section className="neonHero">
        <div className="container neonHero__grid">
          <div className="neonHero__copy">
            {store.storeLogo ? (
              <img
                className="neonHero__logo"
                src={store.storeLogo}
                alt={store.storeName}
              />
            ) : null}

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
            <span className="neonPromise__icon" />
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
              className={`neonCollectionCard neonCollectionCard--${card.tone}`}
              href={`/shop?category=${encodeURIComponent(card.collection.name)}`}
              key={card.category}
            >
              <div className="neonCollectionCard__arch">
                {card.collection.image ? (
                  <img
                    src={card.collection.image}
                    alt={card.collection.name}
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </div>
              <div className="neonCollectionCard__copy">
                <h3>{card.title}</h3>
                <p>{card.label}</p>
                <span>Explore</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container neonSection">
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
                  {index % 2 === 0 ? 'Trending' : 'New'}
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
                  {inStock ? 'Add To Cart' : 'Out Of Stock'}
                </AddToCartButton>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container neonStory">
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
      </section>

      <section className="container neonTrustStrip" aria-label="More benefits">
        {[
          'Premium Materials',
          'Secure Packaging',
          'Easy Returns',
          'Happy Customers',
        ].map((item) => (
          <div key={item}>
            <span />
            <strong>{item}</strong>
          </div>
        ))}
      </section>

      <section className="container neonSection neonInstaSection">
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

      <section className="container neonOfferBanner">
        <span>First Order Special</span>
        <strong>20% Off</strong>
        <span>On Your First Order</span>
        <mark>Use Code: HYD20</mark>
      </section>

      <section className="container neonWhy">
        <div className="neonSectionHead">
          <span />
          <h2>Why Choose Us</h2>
          <span />
        </div>
        <div className="neonWhy__grid">
          {whyChoose.map((item) => (
            <article key={item}>
              <span />
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
