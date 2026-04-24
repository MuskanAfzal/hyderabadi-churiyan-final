'use client';

import { useEffect, useState } from 'react';
import type { StoreSettings } from '@/lib/storefront';
import { AdminImagePicker } from './admin-image-picker';
import { AdminPasswordForm } from './admin-password-form';
import { TestimonialsEditor } from './admin-repeatable-fields';

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

const copyFields: Array<{
  key: keyof StoreSettings['siteCopy'];
  label: string;
  multiline?: boolean;
}> = [
  { key: 'homeCategoryTitle', label: 'Home category heading' },
  { key: 'homeShowcaseTitle', label: 'Home showcase heading', multiline: true },
  { key: 'customStoryTitle', label: 'Custom story heading', multiline: true },
  { key: 'customStoryText', label: 'Custom story text', multiline: true },
  { key: 'completeLookTitle', label: 'Complete look heading' },
  { key: 'instagramTitle', label: 'Instagram heading' },
  { key: 'shopTitleFallback', label: 'Shop default title' },
  { key: 'shopIntro', label: 'Shop intro', multiline: true },
  { key: 'footerText', label: 'Footer text', multiline: true },
  { key: 'contactTitle', label: 'Contact heading' },
  { key: 'contactIntro', label: 'Contact intro' },
  { key: 'cartTitle', label: 'Cart heading' },
  { key: 'cartIntro', label: 'Cart intro', multiline: true },
  { key: 'cartEmptyTitle', label: 'Empty cart heading' },
  { key: 'cartEmptyText', label: 'Empty cart text', multiline: true },
];

const currencyOptions = ['PKR', 'USD', 'GBP', 'EUR', 'AED', 'SAR', 'INR'];

export function AdminSettingsClient() {
  const [settings, setSettings] = useState<StoreSettings>(blankSettings);
  const [status, setStatus] = useState('');
  const visibleCurrencyOptions = Array.from(
    new Set([...currencyOptions, settings.currency].filter(Boolean)),
  );

  async function load() {
    const response = await fetch('/api/admin/snapshot', { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      setStatus(data.error || 'Could not load settings.');
      return;
    }

    setSettings(data.settings);
  }

  useEffect(() => {
    void load();
  }, []);

  function patch<K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function patchCopy(key: keyof StoreSettings['siteCopy'], value: string) {
    setSettings((current) => ({
      ...current,
      siteCopy: { ...current.siteCopy, [key]: value },
    }));
  }

  async function save() {
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
      setStatus('Settings saved to the live storefront.');
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Settings save failed.',
      );
    }
  }

  return (
    <section className="adminPage">
      <div className="container">
        <div className="adminSectionHead">
          <div>
            <span className="adminKicker">Website</span>
            <h1>Settings</h1>
            <p>
              Edit brand, homepage copy, contact, gallery, and footer content.
            </p>
          </div>
          <button className="btn btn--primary" type="button" onClick={save}>
            Save Settings
          </button>
        </div>

        {status ? <div className="adminAlert">{status}</div> : null}

        <section className="adminPanelCard">
          <div className="adminFormGrid">
            <AdminPasswordForm />

            <label>
              Store Name
              <input
                className="adminInput"
                value={settings.storeName}
                onChange={(event) => patch('storeName', event.target.value)}
              />
            </label>
            <AdminImagePicker
              className="adminSpan2"
              label="Store Logo"
              value={settings.storeLogo}
              onChange={(image) => patch('storeLogo', image)}
            />
            <label>
              Hero Title
              <input
                className="adminInput"
                value={settings.heroTitle}
                onChange={(event) => patch('heroTitle', event.target.value)}
              />
            </label>
            <label className="adminSpan2">
              Hero Subtitle
              <textarea
                className="adminInput"
                rows={3}
                value={settings.heroSubtitle}
                onChange={(event) => patch('heroSubtitle', event.target.value)}
              />
            </label>
            <AdminImagePicker
              className="adminSpan2"
              label="Homepage Hero Image"
              value={settings.heroImage}
              onChange={(image) => patch('heroImage', image)}
            />
            <label>
              WhatsApp Number
              <input
                className="adminInput"
                value={settings.ownerWhatsapp}
                onChange={(event) => patch('ownerWhatsapp', event.target.value)}
              />
            </label>
            <label>
              Currency
              <select
                className="adminInput"
                value={settings.currency}
                onChange={(event) => patch('currency', event.target.value)}
              >
                {visibleCurrencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              <input
                className="adminInput adminInlineCustomInput"
                placeholder="Or type a custom currency code"
                onBlur={(event) => {
                  const value = event.currentTarget.value.trim().toUpperCase();
                  if (!value) return;
                  patch('currency', value);
                  event.currentTarget.value = '';
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  const value = event.currentTarget.value.trim().toUpperCase();
                  if (!value) return;
                  patch('currency', value);
                  event.currentTarget.value = '';
                }}
              />
            </label>
            <label>
              Instagram Handle
              <input
                className="adminInput"
                value={settings.instagramHandle}
                onChange={(event) =>
                  patch('instagramHandle', event.target.value)
                }
              />
            </label>
            <label className="adminCheckField">
              <input
                type="checkbox"
                checked={settings.announcementBarEnabled}
                onChange={(event) =>
                  patch('announcementBarEnabled', event.target.checked)
                }
              />
              Announcement enabled
            </label>
            <label className="adminSpan2">
              Announcement Text
              <input
                className="adminInput"
                value={settings.announcementBarText}
                onChange={(event) =>
                  patch('announcementBarText', event.target.value)
                }
              />
            </label>

            {copyFields.map((field) => (
              <label
                key={field.key}
                className={field.multiline ? 'adminSpan2' : undefined}
              >
                {field.label}
                {field.multiline ? (
                  <textarea
                    className="adminInput"
                    rows={3}
                    value={settings.siteCopy[field.key]}
                    onChange={(event) =>
                      patchCopy(field.key, event.target.value)
                    }
                  />
                ) : (
                  <input
                    className="adminInput"
                    value={settings.siteCopy[field.key]}
                    onChange={(event) =>
                      patchCopy(field.key, event.target.value)
                    }
                  />
                )}
              </label>
            ))}

            <AdminImagePicker
              className="adminSpan2"
              label="Homepage Gallery Images"
              multiple
              values={settings.galleryImages || []}
              onChangeMany={(images) => patch('galleryImages', images)}
            />
            <TestimonialsEditor
              value={settings.testimonials || []}
              onChange={(testimonials) => patch('testimonials', testimonials)}
            />
          </div>
        </section>
      </div>
    </section>
  );
}
