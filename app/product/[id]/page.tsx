import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { ProductDetailClient } from '@/components/product-detail-client';
import { RecentlyViewed } from '@/components/recently-viewed';
import { getProductPageData, getStoreContext } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [page, store] = await Promise.all([
    getProductPageData(id),
    getStoreContext(),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <>
      <section className="productDetailPage">
        <ProductDetailClient product={page.product} currency={store.currency} />
      </section>

      <section className="productSupportSection reviewsSection">
        <div className="container">
          <div className="sectionHead sectionHead--centered">
            <div>
              <h2>Reviews</h2>
              <p className="muted">
                {page.reviewSummary.count
                  ? `Rated ${page.reviewSummary.avg} average from ${page.reviewSummary.count} review(s)`
                  : 'No reviews yet'}
              </p>
            </div>
          </div>

          <div className="reviewsLayout">
            <div className="panel">
              {page.reviewSummary.reviews.length ? (
                page.reviewSummary.reviews.map((review) => (
                  <div key={review.id} className="reviewItem">
                    <div className="reviewItem__top">
                      <strong>{review.name}</strong>
                      <span>{Number(review.rating || 0)} / 5</span>
                    </div>
                    <p className="muted">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="muted">Be the first to leave a review.</p>
              )}
            </div>

            <form
              className="panel reviewForm"
              method="POST"
              action={`/api/products/${page.product.id}/reviews`}
            >
              <h3>Leave a Review</h3>
              <input
                className="input"
                name="name"
                placeholder="Your name"
                required
              />
              <select
                className="select"
                name="rating"
                defaultValue="5"
                required
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <textarea
                className="input"
                name="comment"
                rows={4}
                placeholder="Write your review"
                required
              />
              <button className="btn btn--primary" type="submit">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="productSupportSection">
        <div className="container">
          <div className="sectionHead sectionHead--centered">
            <div>
              <h2>Recently Viewed</h2>
              <p className="muted">Items you looked at recently.</p>
            </div>
          </div>

          <RecentlyViewed
            currentId={page.product.id}
            currency={store.currency}
          />
        </div>
      </section>

      {page.related.length ? (
        <section className="productSupportSection productRelatedSection">
          <div className="container">
            <div className="sectionHead sectionHead--centered">
              <div>
                <h2>You may also like</h2>
                <p className="muted">
                  Related pieces from the same collection.
                </p>
              </div>
            </div>

            <div className="grid productRelatedGrid">
              {page.related.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={store.currency}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
