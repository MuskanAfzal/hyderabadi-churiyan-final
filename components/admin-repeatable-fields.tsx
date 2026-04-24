'use client';

import type { FocusEvent, KeyboardEvent } from 'react';
import type { StoreSettings, VariantStock } from '@/lib/storefront';

type Testimonial = StoreSettings['testimonials'][number];

type Option = {
  value: string;
  label: string;
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function cleanRuleRows(rows: Option[]) {
  return rows.filter((row) => row.value.trim());
}

function cleanOptions(values: string[]) {
  return Array.from(
    new Set(values.map((value) => String(value || '').trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
}

function addCustomValue(
  event: FocusEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>,
  onAdd: (value: string) => void,
) {
  const value = event.currentTarget.value.trim();
  if (!value) return;

  onAdd(value);
  event.currentTarget.value = '';
}

function VariantOptionField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const choices = cleanOptions([...options, value || '']);

  return (
    <label>
      {label}
      {choices.length ? (
        <select
          className="adminInput"
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Any {label.toLowerCase()}</option>
          {choices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="adminInput"
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      <input
        className="adminInput adminInlineCustomInput"
        placeholder={`Or type new ${label.toLowerCase()}`}
        onBlur={(event) => addCustomValue(event, onChange)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          addCustomValue(event, onChange);
        }}
      />
    </label>
  );
}

export function VariantStockEditor({
  value,
  onChange,
  choices,
}: {
  value: VariantStock[];
  onChange: (value: VariantStock[]) => void;
  choices?: {
    colors?: string[];
    materials?: string[];
    sizes?: string[];
  };
}) {
  const rows = Array.isArray(value) ? value : [];

  function update(index: number, patch: Partial<VariantStock>) {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  return (
    <div className="adminRepeater adminSpan2">
      <div className="adminRepeater__head">
        <div>
          <span className="adminLabel">Variant Stock</span>
          <p>Use this only when stock differs by size, color, or material.</p>
        </div>
        <button
          className="btn btn--ghost btn--small"
          type="button"
          onClick={() =>
            onChange([...rows, { size: '', color: '', material: '', stock: 0 }])
          }
        >
          Add Variant
        </button>
      </div>

      {rows.length ? (
        <div className="adminRepeater__rows">
          {rows.map((row, index) => (
            <div className="adminRepeaterRow adminVariantRow" key={index}>
              <VariantOptionField
                label="Size"
                value={row.size || ''}
                options={choices?.sizes || []}
                onChange={(size) => update(index, { size })}
              />
              <VariantOptionField
                label="Color"
                value={row.color || ''}
                options={choices?.colors || []}
                onChange={(color) => update(index, { color })}
              />
              <VariantOptionField
                label="Material"
                value={row.material || ''}
                options={choices?.materials || []}
                onChange={(material) => update(index, { material })}
              />
              <label>
                Stock
                <input
                  className="adminInput"
                  min={0}
                  type="number"
                  value={row.stock}
                  onChange={(event) =>
                    update(index, {
                      stock: Math.max(
                        0,
                        Math.round(Number(event.target.value || 0)),
                      ),
                    })
                  }
                />
              </label>
              <button
                className="btn btn--danger btn--small"
                type="button"
                onClick={() =>
                  onChange(rows.filter((_, rowIndex) => rowIndex !== index))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="adminRepeater__empty">No variant-specific stock added.</p>
      )}
    </div>
  );
}

export function OptionListEditor({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string[];
  options: string[];
  placeholder: string;
  onChange: (value: string[]) => void;
}) {
  const selected = Array.isArray(value) ? value : [];
  const available = cleanOptions(options).filter(
    (option) => !selected.includes(option),
  );

  function addValue(nextValue: string) {
    const clean = nextValue.trim();
    if (!clean) return;
    onChange(Array.from(new Set([...selected, clean])));
  }

  return (
    <div className="adminOptionEditor">
      <span className="adminLabel">{label}</span>

      <div className="adminOptionEditor__picker">
        <select
          className="adminInput"
          defaultValue=""
          onChange={(event) => {
            addValue(event.target.value);
            event.currentTarget.value = '';
          }}
        >
          <option value="">Choose existing...</option>
          {available.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          className="adminInput"
          placeholder={placeholder}
          onBlur={(event) => addCustomValue(event, addValue)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            addCustomValue(event, addValue);
          }}
        />
      </div>

      {selected.length ? (
        <div className="adminOptionChips">
          {selected.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                onChange(selected.filter((entry) => entry !== item))
              }
            >
              {item}
              <span>Remove</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="adminRepeater__empty">
          No {label.toLowerCase()} selected.
        </p>
      )}
    </div>
  );
}

export function TestimonialsEditor({
  value,
  onChange,
}: {
  value: Testimonial[];
  onChange: (value: Testimonial[]) => void;
}) {
  const rows = Array.isArray(value) ? value : [];

  function update(index: number, patch: Partial<Testimonial>) {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  return (
    <div className="adminRepeater adminSpan2">
      <div className="adminRepeater__head">
        <div>
          <span className="adminLabel">Testimonials</span>
          <p>Add customer quotes that can appear on the storefront.</p>
        </div>
        <button
          className="btn btn--ghost btn--small"
          type="button"
          onClick={() => onChange([...rows, { quote: '', name: '', role: '' }])}
        >
          Add Testimonial
        </button>
      </div>

      {rows.length ? (
        <div className="adminRepeater__rows">
          {rows.map((row, index) => (
            <div className="adminRepeaterRow adminTestimonialRow" key={index}>
              <label className="adminSpan2">
                Customer Quote
                <textarea
                  className="adminInput"
                  rows={3}
                  value={row.quote || ''}
                  onChange={(event) =>
                    update(index, { quote: event.target.value })
                  }
                />
              </label>
              <label>
                Customer Name
                <input
                  className="adminInput"
                  value={row.name || ''}
                  onChange={(event) =>
                    update(index, { name: event.target.value })
                  }
                />
              </label>
              <label>
                Role or Order Type
                <input
                  className="adminInput"
                  value={row.role || ''}
                  onChange={(event) =>
                    update(index, { role: event.target.value })
                  }
                />
              </label>
              <button
                className="btn btn--danger btn--small"
                type="button"
                onClick={() =>
                  onChange(rows.filter((_, rowIndex) => rowIndex !== index))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="adminRepeater__empty">No testimonials added.</p>
      )}
    </div>
  );
}

export function SaleRulesEditor({
  label,
  value,
  options,
  emptyText,
  onChange,
}: {
  label: string;
  value: Record<string, number>;
  options: Option[];
  emptyText: string;
  onChange: (value: Record<string, number>) => void;
}) {
  const rows = Object.entries(value || {}).map(([key, percent]) => ({
    value: key,
    label: String(clampPercent(Number(percent || 0))),
  }));

  function updateRows(nextRows: Option[]) {
    const next: Record<string, number> = {};
    cleanRuleRows(nextRows).forEach((row) => {
      next[row.value.trim().toLowerCase()] = clampPercent(
        Number(row.label || 0),
      );
    });
    onChange(next);
  }

  return (
    <div className="adminRepeater adminSpan2">
      <div className="adminRepeater__head">
        <div>
          <span className="adminLabel">{label}</span>
          <p>{emptyText}</p>
        </div>
        <button
          className="btn btn--ghost btn--small"
          type="button"
          onClick={() => updateRows([...rows, { value: '', label: '0' }])}
        >
          Add Rule
        </button>
      </div>

      {rows.length ? (
        <div className="adminRepeater__rows">
          {rows.map((row, index) => (
            <div className="adminRepeaterRow adminSaleRuleRow" key={index}>
              <label>
                Applies To
                {options.length ? (
                  <select
                    className="adminInput"
                    value={row.value}
                    onChange={(event) => {
                      const next = [...rows];
                      next[index] = { ...row, value: event.target.value };
                      updateRows(next);
                    }}
                  >
                    <option value="">Choose...</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="adminInput"
                    value={row.value}
                    onChange={(event) => {
                      const next = [...rows];
                      next[index] = { ...row, value: event.target.value };
                      updateRows(next);
                    }}
                  />
                )}
              </label>
              <label>
                Discount %
                <input
                  className="adminInput"
                  min={0}
                  max={100}
                  type="number"
                  value={row.label}
                  onChange={(event) => {
                    const next = [...rows];
                    next[index] = { ...row, label: event.target.value };
                    updateRows(next);
                  }}
                />
              </label>
              <button
                className="btn btn--danger btn--small"
                type="button"
                onClick={() =>
                  updateRows(rows.filter((_, rowIndex) => rowIndex !== index))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="adminRepeater__empty">No custom sale rules added.</p>
      )}
    </div>
  );
}
