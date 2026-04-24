import { getStoreContext } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const store = await getStoreContext();
  const phone = String(store.ownerWhatsapp || '').replace(/[^\d]/g, '');

  return (
    <section className="section">
      <div className="container contact">
        <div className="contactCard">
          <h1>{store.settings.siteCopy.contactTitle}</h1>
          <p className="muted">{store.settings.siteCopy.contactIntro}</p>

          <div className="contactBox">
            <div>
              <div className="label">Owner WhatsApp</div>
              <div className="value">{store.ownerWhatsapp || 'Not set'}</div>
            </div>
            <a
              className="btn btn--primary"
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
