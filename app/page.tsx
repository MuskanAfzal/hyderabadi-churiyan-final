import Link from 'next/link';
import { getHomeData, getStoreContext } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [home, store] = await Promise.all([getHomeData(), getStoreContext()]);
  const copy = home.settings.siteCopy;
  const gallery = (
    home.settings.galleryImages?.length
      ? home.settings.galleryImages
      : home.featured.slice(0, 6).map((product) => product.image)
  )
    .filter(Boolean)
    .slice(0, 6);
  const categoryOrder = [
    'Bridal Bangles',
    'Custom Bangles',
    'Chooriyan Sets',
    'Necklaces',
    'Earrings',
    'Head Accessories',
  ];
  const orderedCollections = categoryOrder
    .map((name) =>
      home.collections.find((collection) => collection.name === name),
    )
    .filter((collection): collection is (typeof home.collections)[number] =>
      Boolean(collection),
    )
    .concat(
      home.collections.filter(
        (collection) => !categoryOrder.includes(collection.name),
      ),
    )
    .slice(0, 6);
  const featuredProducts = home.featured.slice(0, 8);
  const editorialPrimary = home.featured[3] || home.featured[0];
  const editorialSecondary = home.featured[10] || home.featured[1];
  const showcaseProducts = featuredProducts.slice(2, 8);
  const accessoryProducts = home.featured
    .filter((product) =>
      ['Necklaces', 'Earrings', 'Head Accessories'].includes(product.category),
    )
    .slice(0, 3);

  return (
    <>
      <section className="hero hero--full tiffanyHero">
        <div className="heroBanner">
          <video className="heroVideo" autoPlay muted loop playsInline>
            <source
              src="/uploads/hyderabadi-churiyan/new-reels.mp4"
              type="video/mp4"
            />
          </video>
          <div className="heroBanner__overlay" />
          <div className="tiffanyHero__mark">
            <span>{store.storeName}</span>
          </div>
        </div>
      </section>

      <section className="tiffanyIntro">
        <div className="container tiffanyIntro__inner">
          <h1>
            {home.settings.heroTitle || 'Custom Churiyan for Every Celebration'}
          </h1>
          <p>
            {home.settings.heroSubtitle ||
              'Bridal bangles, custom churiyan, kaleeras and accessories made around your outfit.'}
          </p>
          <Link className="btn btn--primary" href="/shop">
            Shop Now
          </Link>
        </div>
      </section>

      {store.saleBanner?.active ? (
        <section className="section saleBannerSection">
          <div className="container">
            <div className="saleBanner">
              <div>
                <span className="badgePill">Special Offer</span>
                <h2>{store.saleBanner.title || '30% OFF SALE'}</h2>
                <p className="muted">
                  {store.saleBanner.text ||
                    'Limited-time offers on selected favourites.'}
                </p>
              </div>
              <Link className="btn btn--primary" href="/shop">
                {store.saleBanner.buttonText || 'Shop the Sale'}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="tiffanySection tiffanyCategories">
        <div className="container">
          <h2 className="tiffanyTitle">{copy.homeCategoryTitle}</h2>

          <div className="tiffanyCategoryGrid">
            {orderedCollections.map((collection) => (
              <Link
                key={collection.name}
                className="tiffanyCategoryCard"
                href={`/shop?category=${encodeURIComponent(collection.name)}`}
              >
                <div className="tiffanyCategoryCard__media">
                  {collection.image ? (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="collectionPlaceholder" />
                  )}
                </div>
                <h3>{collection.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="tiffanySection tiffanyFeaturePair">
        <div className="container tiffanyFeaturePair__grid">
          {editorialPrimary ? (
            <article className="tiffanyFeature">
              <Link href={`/product/${editorialPrimary.id}`}>
                <img
                  src={editorialPrimary.image}
                  alt={editorialPrimary.title}
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <div className="tiffanyFeature__body">
                <h2>{copy.homeFeaturePrimaryTitle}</h2>
                <Link className="link" href="/shop?category=Custom%20Bangles">
                  {copy.homeFeaturePrimaryCta}
                </Link>
              </div>
            </article>
          ) : null}

          {editorialSecondary ? (
            <article className="tiffanyFeature">
              <Link href={`/product/${editorialSecondary.id}`}>
                <img
                  src={editorialSecondary.image}
                  alt={editorialSecondary.title}
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <div className="tiffanyFeature__body">
                <h2>{copy.homeFeatureSecondaryTitle}</h2>
                <Link className="link" href="/shop?category=Earrings">
                  {copy.homeFeatureSecondaryCta}
                </Link>
              </div>
            </article>
          ) : null}
        </div>
      </section>

      <section className="homeShowcase">
        <div className="container">
          <div className="homeShowcase__head">
            <span>{copy.homeShowcaseKicker}</span>
            <h2>{copy.homeShowcaseTitle}</h2>
            <Link className="link" href="/shop">
              {copy.homeShowcaseLink}
            </Link>
          </div>

          <div className="homeShowcase__grid">
            {editorialPrimary ? (
              <Link
                className="homeShowcase__feature"
                href={`/product/${editorialPrimary.id}`}
              >
                <img
                  src={editorialPrimary.image}
                  alt={editorialPrimary.title}
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <span>Custom Bangles</span>
                  <h3>{editorialPrimary.title}</h3>
                  <p>{editorialPrimary.shortDesc}</p>
                </div>
              </Link>
            ) : null}

            <div className="homeProductTiles">
              {showcaseProducts.map((product) => (
                <Link
                  key={product.id}
                  className="homeProductTile"
                  href={`/product/${product.id}`}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h3>{product.title}</h3>
                    <p>
                      {store.currency} {product.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="customStory">
        <div className="customStory__media">
          {editorialSecondary ? (
            <img
              src={editorialSecondary.image}
              alt={editorialSecondary.title}
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </div>
        <div className="customStory__copy">
          <span>{copy.customStoryKicker}</span>
          <h2>{copy.customStoryTitle}</h2>
          <p>{copy.customStoryText}</p>
          <Link
            className="btn btn--primary"
            href="/shop?category=Custom%20Bangles"
          >
            {copy.customStoryButton}
          </Link>
        </div>
      </section>

      <section className="tiffanySection tiffanyExperience">
        <div className="container">
          <h2 className="tiffanyTitle">{copy.completeLookTitle}</h2>
          <div className="tiffanyExperience__grid accessoriesEdit">
            {(accessoryProducts.length
              ? accessoryProducts
              : featuredProducts.slice(0, 3)
            ).map((product) => (
              <Link
                key={product.id}
                className="accessoryCard"
                href={`/product/${product.id}`}
              >
                <img
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                  decoding="async"
                />
                <h3>{product.title}</h3>
                <p>{product.shortDesc}</p>
                <span>Shop {product.category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="tiffanySection instaSection">
        <div className="container">
          <h2 className="tiffanyTitle">{copy.instagramTitle}</h2>
          <div className="instaStrip">
            {gallery.map((image, index) => (
              <Link
                key={`${image}-${index}`}
                className="instaCard"
                href="/shop"
              >
                <img
                  src={image}
                  alt={store.storeName}
                  loading="lazy"
                  decoding="async"
                />
                <span className="instaOverlay">
                  @
                  {String(store.instagramHandle)
                    .replace(/\s+/g, '')
                    .toLowerCase()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
