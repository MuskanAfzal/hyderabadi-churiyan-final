import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container contact">
        <div className="contactCard">
          <h1>Product Not Found</h1>
          <p className="muted">
            The item you are looking for is unavailable or has been removed.
          </p>
          <div className="card__actions" style={{ marginTop: 18 }}>
            <Link className="btn btn--primary" href="/shop">
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
