import { query } from './postgres';
import { FileDB } from './filedb';

export type DiscountCode = {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  isActive: boolean;
};

export class DiscountsService {
  private db = new FileDB<{ codes: DiscountCode[] }>('data/discounts.json', {
    codes: [],
  });

  async list() {
    try {
      const { rows } = await query(
        `select * from discounts order by created_at desc`,
      );
      return rows.map((x: any) => ({
        code: x.code,
        type: x.type,
        value: Number(x.value || 0),
        isActive: !!x.is_active,
      }));
    } catch {
      return this.db.read().codes || [];
    }
  }

  async create(input: DiscountCode) {
    const safe = {
      code: String(input.code || '').trim(),
      type: input.type === 'fixed' ? 'fixed' : 'percent',
      value: Math.max(0, Number(input.value || 0)),
      isActive: !!input.isActive,
    } as DiscountCode;

    try {
      await query(
        `
        insert into discounts (code, type, value, is_active)
        values ($1,$2,$3,$4)
        on conflict (code) do update
        set type = excluded.type,
            value = excluded.value,
            is_active = excluded.is_active
        `,
        [safe.code, safe.type, Number(safe.value || 0), !!safe.isActive],
      );
    } catch {
      // Local JSON keeps coupons usable in the file-backed storefront.
    }

    const current = this.db.read().codes || [];
    const next = [
      safe,
      ...current.filter(
        (code) => code.code.toLowerCase() !== safe.code.toLowerCase(),
      ),
    ];
    this.db.write({ codes: next });

    return safe;
  }

  async remove(code: string) {
    try {
      await query(`delete from discounts where lower(code) = lower($1)`, [
        code,
      ]);
    } catch {
      // Local JSON keeps coupons usable in the file-backed storefront.
    }

    const key = String(code || '')
      .trim()
      .toLowerCase();
    this.db.write({
      codes: (this.db.read().codes || []).filter(
        (item) => item.code.toLowerCase() !== key,
      ),
    });
  }

  async validate(code: string, subtotal: number) {
    const key = String(code || '').trim();
    let found: any = null;

    try {
      const { rows } = await query(
        `select * from discounts where is_active = true and lower(code) = lower($1) limit 1`,
        [key],
      );
      found = rows[0];
    } catch {
      found = (this.db.read().codes || []).find(
        (item) =>
          item.isActive && item.code.toLowerCase() === key.toLowerCase(),
      );
    }

    if (!found) return { ok: false, error: 'Invalid code' };

    let discount = 0;
    if (found.type === 'percent')
      discount = Math.round(subtotal * (Number(found.value || 0) / 100));
    else discount = Number(found.value || 0);

    discount = Math.round(Math.min(discount, subtotal));

    return {
      ok: true,
      code: found.code,
      type: found.type,
      value: Number(found.value || 0),
      discount,
    };
  }
}
