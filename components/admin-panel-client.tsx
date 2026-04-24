'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { ProductRecord, StoreSettings } from '@/lib/storefront';
import { AdminImagePicker } from './admin-image-picker';
import {
  TestimonialsEditor,
  VariantStockEditor,
} from './admin-repeatable-fields';

type Snapshot = {
  settings: StoreSettings;
  products: ProductRecord[];
  catalog: {
    categories: string[];
    sizes: string[];
    colors: string[];
    materials: string[];
  };
};

type Status = {
  tone: 'idle' | 'success' | 'error';
  text: string;
};

const blankSettings: StoreSettings = {
  storeName: '',
  storeLogo: '',
  heroTitle: '',
  heroSubtitle: '',
  heroImage: '',
  ownerWhatsapp: '',
  currency: 'PKR',
  instagramHandle: '',
  announcementBarEnabled: false,
  announcementBarText: '',
  saleBannerEnabled: false,
  saleBannerTitle: '',
  saleBannerText: '',
  saleBannerButtonText: '',
  emailPopupEnabled: false,
  emailPopupTitle: '',
  emailPopupText: '',
  testimonials: [],
  galleryImages: [],
  siteCopy: {
    homeCategoryTitle: '',
    homeFeaturePrimaryTitle: '',
    homeFeaturePrimaryCta: '',
    homeFeatureSecondaryTitle: '',
    homeFeatureSecondaryCta: '',
    homeShowcaseKicker: '',
    homeShowcaseTitle: '',
    homeShowcaseLink: '',
    customStoryKicker: '',
    customStoryTitle: '',
    customStoryText: '',
    customStoryButton: '',
    completeLookTitle: '',
    instagramTitle: '',
    shopKicker: '',
    shopTitleFallback: '',
    shopIntro: '',
    shopPrimaryButton: '',
    shopSecondaryButton: '',
    footerText: '',
    contactTitle: '',
    contactIntro: '',
    cartEyebrow: '',
    cartTitle: '',
    cartIntro: '',
    cartEmptyTitle: '',
    cartEmptyText: '',
  },
};

type SiteCopyKey = keyof StoreSettings['siteCopy'];

const siteCopyFields: Array<{
  key: SiteCopyKey;
  label: string;
  multiline?: boolean;
}> = [
  { key: 'homeCategoryTitle', label: 'Home category heading' },
  { key: 'homeFeaturePrimaryTitle', label: 'Home feature 1 title' },
  { key: 'homeFeaturePrimaryCta', label: 'Home feature 1 button' },
  { key: 'homeFeatureSecondaryTitle', label: 'Home feature 2 title' },
  { key: 'homeFeatureSecondaryCta', label: 'Home feature 2 button' },
  { key: 'homeShowcaseKicker', label: 'Showcase eyebrow' },
  { key: 'homeShowcaseTitle', label: 'Showcase heading', multiline: true },
  { key: 'homeShowcaseLink', label: 'Showcase link' },
  { key: 'customStoryKicker', label: 'Custom story eyebrow' },
  { key: 'customStoryTitle', label: 'Custom story heading', multiline: true },
  { key: 'customStoryText', label: 'Custom story text', multiline: true },
  { key: 'customStoryButton', label: 'Custom story button' },
  { key: 'completeLookTitle', label: 'Complete look heading' },
  { key: 'instagramTitle', label: 'Instagram/gallery heading' },
  { key: 'shopKicker', label: 'Shop hero eyebrow' },
  { key: 'shopTitleFallback', label: 'Shop default title' },
  { key: 'shopIntro', label: 'Shop hero text', multiline: true },
  { key: 'shopPrimaryButton', label: 'Shop primary button' },
  { key: 'shopSecondaryButton', label: 'Shop secondary button' },
  { key: 'footerText', label: 'Footer description', multiline: true },
  { key: 'contactTitle', label: 'Contact heading' },
  { key: 'contactIntro', label: 'Contact intro' },
  { key: 'cartEyebrow', label: 'Cart eyebrow' },
  { key: 'cartTitle', label: 'Cart heading' },
  { key: 'cartIntro', label: 'Cart intro', multiline: true },
  { key: 'cartEmptyTitle', label: 'Empty cart heading' },
  { key: 'cartEmptyText', label: 'Empty cart text', multiline: true },
];

function emptyProduct(): ProductRecord {
  return {
    id: '',
    title: 'New product',
    category: 'Custom Bangles',
    brand: 'Hyderabadi Churiyan',
    price: 0,
    stock: 1,
    shortDesc: '',
    description: '',
    image: '',
    hoverImage: '',
    images: [],
    visibility: 'active',
    featured: false,
    sizes: [],
    colors: [],
    materials: [],
    variantStocks: [],
  };
}

function arrayToText(value?: string[]) {
  return (value || []).join('\n');
}

function textToArray(value: string) {
  return Array.from(
    new Set(
      value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function AdminPanelClient() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>({
    tone: 'idle',
    text: 'Admin changes save straight into the storefront data.',
  });
  const [settings, setSettings] = useState<StoreSettings>(blankSettings);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [catalog, setCatalog] = useState<Snapshot['catalog']>({
    categories: [],
    sizes: [],
    colors: [],
    materials: [],
  });
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState<ProductRecord>(emptyProduct());
  const [sizeText, setSizeText] = useState('');
  const [colorText, setColorText] = useState('');
  const [materialText, setMaterialText] = useState('');

  const selectedExists = products.some((product) => product.id === selectedId);
  const filteredProducts = useMemo(
    () =>
      [...products].sort((a, b) =>
        String(a.title || '').localeCompare(String(b.title || '')),
      ),
    [products],
  );

  function loadProduct(product: ProductRecord) {
    setSelectedId(product.id);
    setDraft(product);
    setSizeText(arrayToText(product.sizes));
    setColorText(arrayToText(product.colors));
    setMaterialText(arrayToText(product.materials));
  }

  async function loadSnapshot() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/snapshot', {
        cache: 'no-store',
      });
      const data = (await response.json()) as Snapshot & {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || data.ok === false) {
        throw new Error(data.error || 'Could not load admin data.');
      }

      setSettings(data.settings);
      setProducts(data.products || []);
      setCatalog(data.catalog);

      if (data.products?.length) {
        loadProduct(data.products[0]);
      }

      setStatus({
        tone: 'success',
        text: 'Admin data loaded from the same files the storefront uses.',
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        text:
          error instanceof Error ? error.message : 'Could not load admin data.',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSnapshot();
  }, []);

  function patchSettings<K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function patchSiteCopy(key: SiteCopyKey, value: string) {
    setSettings((current) => ({
      ...current,
      siteCopy: {
        ...current.siteCopy,
        [key]: value,
      },
    }));
  }

  function patchProduct<K extends keyof ProductRecord>(
    key: K,
    value: ProductRecord[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function renderCatalogHint(label: string, items: string[]) {
    if (!items.length) return null;
    return (
      <span className="adminHint">
        Existing {label}: {items.slice(0, 8).join(', ')}
      </span>
    );
  }

  async function saveSettings() {
    try {
      const payload = {
        ...settings,
        galleryImages: settings.galleryImages || [],
        testimonials: settings.testimonials || [],
      };
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Settings save failed.');
      }

      setSettings(data.settings);
      setStatus({
        tone: 'success',
        text: 'Website content saved. Refresh the storefront to see it live.',
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Could not save website content.',
      });
    }
  }

  async function saveProduct() {
    try {
      const payload = {
        ...draft,
        images: draft.images || [],
        sizes: textToArray(sizeText),
        colors: textToArray(colorText),
        materials: textToArray(materialText),
        variantStocks: draft.variantStocks || [],
      };
      const response = await fetch(
        selectedExists
          ? `/api/admin/products/${draft.id}`
          : '/api/admin/products',
        {
          method: selectedExists ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Product save failed.');
      }

      const saved = data.product as ProductRecord;
      setProducts((current) => {
        const exists = current.some((product) => product.id === saved.id);
        return exists
          ? current.map((product) =>
              product.id === saved.id ? saved : product,
            )
          : [saved, ...current];
      });
      loadProduct(saved);
      setStatus({
        tone: 'success',
        text: `${saved.title} is saved and connected to shop, product detail, cart, and search.`,
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Could not save the product.',
      });
    }
  }

  async function deleteProduct() {
    if (!selectedExists || !draft.id) return;
    if (!window.confirm(`Delete ${draft.title}?`)) return;

    try {
      const response = await fetch(`/api/admin/products/${draft.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Product delete failed.');
      }

      const next = products.filter((product) => product.id !== draft.id);
      setProducts(next);
      if (next.length) {
        loadProduct(next[0]);
      } else {
        setSelectedId('');
        setDraft(emptyProduct());
      }
      setStatus({
        tone: 'success',
        text: 'Product removed from the storefront.',
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Could not delete the product.',
      });
    }
  }

  return (
    <section className="adminPage">
      <div className="container adminShell">
        <header className="adminHero">
          <div>
            <span>Hyderabadi Churiyan Admin</span>
            <h1>Website control panel</h1>
            <p>
              Edit homepage content, logo, product images, stock, sizes, colors,
              and materials from one place.
            </p>
          </div>
          <div className="adminHero__actions">
            <Link className="btn btn--ghost" href="/">
              View site
            </Link>
            <Link className="btn btn--primary" href="/shop">
              View shop
            </Link>
          </div>
        </header>

        <div className={`adminStatus adminStatus--${status.tone}`}>
          {loading ? 'Loading admin data...' : status.text}
        </div>

        <div className="adminGrid">
          <section className="adminPanel">
            <div className="adminPanel__head">
              <div>
                <span>Homepage and brand</span>
                <h2>Website content</h2>
              </div>
              <button
                className="btn btn--primary"
                type="button"
                onClick={saveSettings}
              >
                Save content
              </button>
            </div>

            <div className="adminFields">
              <label>
                Store name
                <input
                  value={settings.storeName}
                  onChange={(event) =>
                    patchSettings('storeName', event.target.value)
                  }
                />
              </label>
              <AdminImagePicker
                className="adminFull"
                label="Logo Image"
                value={settings.storeLogo}
                onChange={(image) => patchSettings('storeLogo', image)}
              />
              <label>
                Hero title
                <input
                  value={settings.heroTitle}
                  onChange={(event) =>
                    patchSettings('heroTitle', event.target.value)
                  }
                />
              </label>
              <label>
                Hero subtitle
                <textarea
                  rows={3}
                  value={settings.heroSubtitle}
                  onChange={(event) =>
                    patchSettings('heroSubtitle', event.target.value)
                  }
                />
              </label>
              <AdminImagePicker
                className="adminFull"
                label="Hero Fallback Image"
                value={settings.heroImage}
                onChange={(image) => patchSettings('heroImage', image)}
              />
              <label>
                WhatsApp number
                <input
                  value={settings.ownerWhatsapp}
                  onChange={(event) =>
                    patchSettings('ownerWhatsapp', event.target.value)
                  }
                />
              </label>
              <label>
                Currency
                <input
                  value={settings.currency}
                  onChange={(event) =>
                    patchSettings('currency', event.target.value)
                  }
                />
              </label>
              <label>
                Instagram handle
                <input
                  value={settings.instagramHandle}
                  onChange={(event) =>
                    patchSettings('instagramHandle', event.target.value)
                  }
                />
              </label>
              <label className="adminCheck">
                <input
                  type="checkbox"
                  checked={settings.announcementBarEnabled}
                  onChange={(event) =>
                    patchSettings(
                      'announcementBarEnabled',
                      event.target.checked,
                    )
                  }
                />
                Announcement bar enabled
              </label>
              <label>
                Announcement text
                <input
                  value={settings.announcementBarText}
                  onChange={(event) =>
                    patchSettings('announcementBarText', event.target.value)
                  }
                />
              </label>
              <label className="adminCheck">
                <input
                  type="checkbox"
                  checked={settings.saleBannerEnabled}
                  onChange={(event) =>
                    patchSettings('saleBannerEnabled', event.target.checked)
                  }
                />
                Sale banner enabled
              </label>
              <label>
                Sale banner title
                <input
                  value={settings.saleBannerTitle}
                  onChange={(event) =>
                    patchSettings('saleBannerTitle', event.target.value)
                  }
                />
              </label>
              <label>
                Sale banner text
                <textarea
                  rows={2}
                  value={settings.saleBannerText}
                  onChange={(event) =>
                    patchSettings('saleBannerText', event.target.value)
                  }
                />
              </label>
              <label>
                Sale banner button
                <input
                  value={settings.saleBannerButtonText}
                  onChange={(event) =>
                    patchSettings('saleBannerButtonText', event.target.value)
                  }
                />
              </label>
              <AdminImagePicker
                className="adminFull"
                label="Gallery Images"
                multiple
                values={settings.galleryImages || []}
                onChangeMany={(images) =>
                  patchSettings('galleryImages', images)
                }
              />
              <div className="adminSubhead adminFull">
                <span>Editable page copy</span>
                <p>
                  These labels and paragraphs feed the homepage, shop hero,
                  cart, contact page, and footer.
                </p>
              </div>
              {siteCopyFields.map((field) => (
                <label
                  key={field.key}
                  className={field.multiline ? 'adminFull' : undefined}
                >
                  {field.label}
                  {field.multiline ? (
                    <textarea
                      rows={3}
                      value={settings.siteCopy[field.key]}
                      onChange={(event) =>
                        patchSiteCopy(field.key, event.target.value)
                      }
                    />
                  ) : (
                    <input
                      value={settings.siteCopy[field.key]}
                      onChange={(event) =>
                        patchSiteCopy(field.key, event.target.value)
                      }
                    />
                  )}
                </label>
              ))}
              <TestimonialsEditor
                value={settings.testimonials || []}
                onChange={(testimonials) =>
                  patchSettings('testimonials', testimonials)
                }
              />
            </div>
          </section>

          <section className="adminPanel">
            <div className="adminPanel__head">
              <div>
                <span>Catalog</span>
                <h2>Products and materials</h2>
              </div>
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => {
                  const product = emptyProduct();
                  setSelectedId('');
                  setDraft(product);
                  setSizeText('');
                  setColorText('');
                  setMaterialText('');
                }}
              >
                New product
              </button>
            </div>

            <div className="adminCatalogMeta">
              <span>{products.length} products</span>
              <span>{catalog.categories.length} categories</span>
              <span>{catalog.materials.length} materials</span>
            </div>

            <div className="adminProductLayout">
              <div className="adminProductList">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className={product.id === selectedId ? 'is-active' : ''}
                    onClick={() => loadProduct(product)}
                  >
                    <span>{product.title}</span>
                    <small>{product.category}</small>
                  </button>
                ))}
              </div>

              <div className="adminProductEditor">
                <div className="adminFields">
                  <label>
                    Product title
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        patchProduct('title', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Category
                    <input
                      list="admin-categories"
                      value={draft.category}
                      onChange={(event) =>
                        patchProduct('category', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Price
                    <input
                      type="number"
                      value={draft.price}
                      onChange={(event) =>
                        patchProduct('price', Number(event.target.value || 0))
                      }
                    />
                  </label>
                  <label>
                    Compare at
                    <input
                      type="number"
                      value={draft.compareAt || ''}
                      onChange={(event) =>
                        patchProduct(
                          'compareAt',
                          event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        )
                      }
                    />
                  </label>
                  <label>
                    Stock
                    <input
                      type="number"
                      value={draft.stock || 0}
                      onChange={(event) =>
                        patchProduct('stock', Number(event.target.value || 0))
                      }
                    />
                  </label>
                  <label>
                    Visibility
                    <select
                      value={draft.visibility || 'active'}
                      onChange={(event) =>
                        patchProduct(
                          'visibility',
                          event.target.value as ProductRecord['visibility'],
                        )
                      }
                    >
                      <option value="active">Active</option>
                      <option value="hidden">Hidden</option>
                      <option value="out_of_stock">Out of stock</option>
                    </select>
                  </label>
                  <label className="adminCheck">
                    <input
                      type="checkbox"
                      checked={!!draft.featured}
                      onChange={(event) =>
                        patchProduct('featured', event.target.checked)
                      }
                    />
                    Featured product
                  </label>
                  <AdminImagePicker
                    className="adminFull"
                    label="Main Image"
                    value={draft.image}
                    onChange={(image) => patchProduct('image', image)}
                  />
                  <AdminImagePicker
                    className="adminFull"
                    label="Hover Image"
                    value={draft.hoverImage || ''}
                    onChange={(image) => patchProduct('hoverImage', image)}
                  />
                  <label className="adminFull">
                    Short description
                    <textarea
                      rows={2}
                      value={draft.shortDesc}
                      onChange={(event) =>
                        patchProduct('shortDesc', event.target.value)
                      }
                    />
                  </label>
                  <label className="adminFull">
                    Full description
                    <textarea
                      rows={4}
                      value={draft.description}
                      onChange={(event) =>
                        patchProduct('description', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Sizes
                    <textarea
                      rows={4}
                      value={sizeText}
                      onChange={(event) => setSizeText(event.target.value)}
                    />
                    {renderCatalogHint('sizes', catalog.sizes)}
                  </label>
                  <label>
                    Colors
                    <textarea
                      rows={4}
                      value={colorText}
                      onChange={(event) => setColorText(event.target.value)}
                    />
                    {renderCatalogHint('colors', catalog.colors)}
                  </label>
                  <label>
                    Materials
                    <textarea
                      rows={4}
                      value={materialText}
                      onChange={(event) => setMaterialText(event.target.value)}
                    />
                    {renderCatalogHint('materials', catalog.materials)}
                  </label>
                  <AdminImagePicker
                    className="adminFull"
                    label="Product Gallery Images"
                    multiple
                    values={draft.images || []}
                    onChangeMany={(images) => patchProduct('images', images)}
                  />
                  <VariantStockEditor
                    value={draft.variantStocks || []}
                    onChange={(variantStocks) =>
                      patchProduct('variantStocks', variantStocks)
                    }
                  />
                </div>

                <datalist id="admin-categories">
                  {catalog.categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>

                <div className="adminProductActions">
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={saveProduct}
                  >
                    {selectedExists ? 'Save product' : 'Create product'}
                  </button>
                  <button
                    className="btn btn--ghost"
                    type="button"
                    onClick={deleteProduct}
                    disabled={!selectedExists}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
