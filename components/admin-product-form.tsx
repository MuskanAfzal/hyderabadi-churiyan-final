'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductCatalog } from '@/lib/admin-catalog';
import type { ProductRecord } from '@/lib/storefront';
import { AdminImagePicker } from './admin-image-picker';
import {
  OptionListEditor,
  VariantStockEditor,
} from './admin-repeatable-fields';

const emptyProduct: ProductRecord = {
  id: '',
  title: '',
  category: 'Custom Bangles',
  brand: 'Hyderabadi Churiyan',
  price: 0,
  stock: 10,
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

export function AdminProductForm({
  product,
  mode,
  catalog,
}: {
  product?: ProductRecord;
  mode: 'create' | 'edit';
  catalog?: ProductCatalog;
}) {
  const router = useRouter();
  const initial = product || emptyProduct;
  const [draft, setDraft] = useState<ProductRecord>(initial);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const categoryOptions = Array.from(
    new Set([...(catalog?.categories || []), draft.category].filter(Boolean)),
  );
  const brandOptions = Array.from(
    new Set([...(catalog?.brands || []), draft.brand || ''].filter(Boolean)),
  );

  function update<K extends keyof ProductRecord>(
    key: K,
    value: ProductRecord[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus('');

    try {
      const payload = {
        ...draft,
        images: draft.images || [],
        sizes: draft.sizes || [],
        colors: draft.colors || [],
        materials: draft.materials || [],
        variantStocks: draft.variantStocks || [],
      };
      const response = await fetch(
        mode === 'edit'
          ? `/api/admin/products/${draft.id}`
          : '/api/admin/products',
        {
          method: mode === 'edit' ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Product save failed.');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Product save failed.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct() {
    if (!draft.id || !window.confirm(`Delete ${draft.title}?`)) return;

    const response = await fetch(`/api/admin/products/${draft.id}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      setStatus(data.error || 'Product delete failed.');
      return;
    }

    router.push('/admin/products');
    router.refresh();
  }

  return (
    <form className="adminForm" onSubmit={save}>
      {status ? <div className="adminAlert">{status}</div> : null}

      <div className="adminFormGrid">
        <label>
          Product Title
          <input
            className="adminInput"
            value={draft.title}
            onChange={(event) => update('title', event.target.value)}
            required
          />
        </label>
        <label>
          Category
          <select
            className="adminInput"
            value={draft.category}
            onChange={(event) => update('category', event.target.value)}
            required
          >
            <option value="">Choose category...</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            className="adminInput adminInlineCustomInput"
            placeholder="Or type a new category"
            onBlur={(event) => {
              const value = event.currentTarget.value.trim();
              if (value) {
                update('category', value);
                event.currentTarget.value = '';
              }
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              const value = event.currentTarget.value.trim();
              if (value) {
                update('category', value);
                event.currentTarget.value = '';
              }
            }}
          />
        </label>
        <label>
          Brand
          <select
            className="adminInput"
            value={draft.brand || ''}
            onChange={(event) => update('brand', event.target.value)}
          >
            <option value="">Choose brand...</option>
            {brandOptions.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <input
            className="adminInput adminInlineCustomInput"
            placeholder="Or type a new brand"
            onBlur={(event) => {
              const value = event.currentTarget.value.trim();
              if (value) {
                update('brand', value);
                event.currentTarget.value = '';
              }
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              const value = event.currentTarget.value.trim();
              if (value) {
                update('brand', value);
                event.currentTarget.value = '';
              }
            }}
          />
        </label>
        <label>
          Price
          <input
            className="adminInput"
            type="number"
            value={draft.price}
            onChange={(event) =>
              update('price', Number(event.target.value || 0))
            }
            required
          />
        </label>
        <label>
          Compare At
          <input
            className="adminInput"
            type="number"
            value={draft.compareAt || ''}
            onChange={(event) =>
              update(
                'compareAt',
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
        </label>
        <label>
          Stock
          <input
            className="adminInput"
            type="number"
            value={draft.stock ?? ''}
            onChange={(event) =>
              update(
                'stock',
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
          />
        </label>
        <label>
          Visibility
          <select
            className="adminInput"
            value={draft.visibility || 'active'}
            onChange={(event) =>
              update(
                'visibility',
                event.target.value as ProductRecord['visibility'],
              )
            }
          >
            <option value="active">active</option>
            <option value="hidden">hidden</option>
            <option value="out_of_stock">out_of_stock</option>
          </select>
        </label>
        <label className="adminCheckField">
          <input
            type="checkbox"
            checked={!!draft.featured}
            onChange={(event) => update('featured', event.target.checked)}
          />
          Featured on homepage
        </label>
        <label className="adminSpan2">
          Short Description
          <textarea
            className="adminInput"
            rows={3}
            value={draft.shortDesc}
            onChange={(event) => update('shortDesc', event.target.value)}
          />
        </label>
        <label className="adminSpan2">
          Full Description
          <textarea
            className="adminInput"
            rows={5}
            value={draft.description}
            onChange={(event) => update('description', event.target.value)}
          />
        </label>
        <AdminImagePicker
          className="adminSpan2"
          label="Main Image"
          value={draft.image}
          onChange={(image) => update('image', image)}
        />
        <AdminImagePicker
          className="adminSpan2"
          label="Hover Image"
          value={draft.hoverImage || ''}
          onChange={(image) => update('hoverImage', image)}
        />
        <OptionListEditor
          label="Sizes"
          value={draft.sizes || []}
          options={catalog?.sizes || []}
          placeholder="Type a new size and press Enter"
          onChange={(sizes) => update('sizes', sizes)}
        />
        <OptionListEditor
          label="Colors"
          value={draft.colors || []}
          options={catalog?.colors || []}
          placeholder="Type a new color and press Enter"
          onChange={(colors) => update('colors', colors)}
        />
        <OptionListEditor
          label="Materials"
          value={draft.materials || []}
          options={catalog?.materials || []}
          placeholder="Type a new material and press Enter"
          onChange={(materials) => update('materials', materials)}
        />
        <AdminImagePicker
          className="adminSpan2"
          label="Product Gallery Images"
          multiple
          values={draft.images || []}
          onChangeMany={(images) => update('images', images)}
        />
        <VariantStockEditor
          value={draft.variantStocks || []}
          choices={{
            colors: [...(catalog?.colors || []), ...(draft.colors || [])],
            materials: [
              ...(catalog?.materials || []),
              ...(draft.materials || []),
            ],
            sizes: [...(catalog?.sizes || []), ...(draft.sizes || [])],
          }}
          onChange={(variantStocks) => update('variantStocks', variantStocks)}
        />
      </div>

      <div className="adminFormActions">
        {mode === 'edit' ? (
          <button
            className="btn btn--danger"
            type="button"
            onClick={deleteProduct}
          >
            Delete Product
          </button>
        ) : null}
        <button className="btn btn--primary" type="submit" disabled={saving}>
          {saving
            ? 'Saving...'
            : mode === 'edit'
              ? 'Update Product'
              : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
