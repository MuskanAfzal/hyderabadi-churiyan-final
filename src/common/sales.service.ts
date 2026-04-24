import { FileDB } from './filedb';

import { preferDatabase } from './data-backend';
import { query } from './postgres';

export type SalesConfig = {
  globalEnabled: boolean;
  globalPercent: number;
  globalTimerEnabled: boolean;
  globalStartAt: string;
  globalEndAt: string;
  categoryRules: Record<string, number>;
  productRules: Record<string, number>;
};

const defaults: SalesConfig = {
  globalEnabled: false,
  globalPercent: 0,
  globalTimerEnabled: false,
  globalStartAt: '',
  globalEndAt: '',
  categoryRules: {},
  productRules: {},
};

export class SalesService {
  private db = new FileDB<SalesConfig>('data/sales.json', defaults);

  private normalize(input: Partial<SalesConfig> = {}): SalesConfig {
    const s = input as SalesConfig;
    return {
      ...defaults,
      ...s,
      categoryRules: s.categoryRules || {},
      productRules: s.productRules || {},
    };
  }

  get(): SalesConfig {
    return this.normalize(this.db.read());
  }

  async getAsync(): Promise<SalesConfig> {
    if (preferDatabase()) {
      try {
        const { rows } = await query<{ data: Partial<SalesConfig> }>(
          `select data from sales_config where id = 1 limit 1`,
        );

        if (rows[0]?.data) {
          return this.normalize(rows[0].data);
        }
      } catch {
        // Local JSON remains the fallback for development/offline use.
      }
    }

    return this.get();
  }

  save(next: SalesConfig) {
    const safe: SalesConfig = {
      globalEnabled: !!next.globalEnabled,
      globalPercent: this.safePercent(next.globalPercent),
      globalTimerEnabled: !!next.globalTimerEnabled,
      globalStartAt: String(next.globalStartAt || '').trim(),
      globalEndAt: String(next.globalEndAt || '').trim(),
      categoryRules: this.safeRules(next.categoryRules || {}),
      productRules: this.safeRules(next.productRules || {}),
    };

    if (safe.globalTimerEnabled && safe.globalStartAt && safe.globalEndAt) {
      const start = new Date(safe.globalStartAt);
      const end = new Date(safe.globalEndAt);
      if (
        !(start instanceof Date) ||
        isNaN(start.getTime()) ||
        !(end instanceof Date) ||
        isNaN(end.getTime()) ||
        end <= start
      ) {
        safe.globalTimerEnabled = false;
        safe.globalStartAt = '';
        safe.globalEndAt = '';
      }
    }

    this.db.write(safe);
    return safe;
  }

  async saveAsync(next: SalesConfig) {
    const safe = this.save(next);

    if (preferDatabase()) {
      try {
        await query(
          `
          insert into sales_config (id, data)
          values (1, $1::jsonb)
          on conflict (id) do update
          set data = excluded.data
          `,
          [JSON.stringify(safe)],
        );
      } catch {
        // Local JSON remains the fallback for development/offline use.
      }
    }

    return safe;
  }

  private safePercent(v: any): number {
    const n = Math.round(Number(v || 0));
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  private safeRules(obj: Record<string, number>): Record<string, number> {
    const out: Record<string, number> = {};
    Object.entries(obj || {}).forEach(([k, v]) => {
      const key = String(k || '')
        .trim()
        .toLowerCase();
      const value = this.safePercent(v);
      if (key) out[key] = value;
    });
    return out;
  }

  isGlobalSaleActive(config?: SalesConfig, now = new Date()): boolean {
    const cfg = config || this.get();
    if (!cfg.globalEnabled) return false;

    if (!cfg.globalTimerEnabled) return cfg.globalPercent > 0;

    const start = cfg.globalStartAt ? new Date(cfg.globalStartAt) : null;
    const end = cfg.globalEndAt ? new Date(cfg.globalEndAt) : null;

    if (!start || isNaN(start.getTime())) return false;
    if (!end || isNaN(end.getTime())) return false;
    if (end <= start) return false;
    if (now < start) return false;
    if (now > end) return false;

    return cfg.globalPercent > 0;
  }

  getRuleSource(
    product: any,
    config?: SalesConfig,
    now = new Date(),
  ): 'none' | 'global' | 'category' | 'product' {
    const cfg = config || this.get();

    const productKey = String(product.id || '').trim();
    if (productKey && cfg.productRules[productKey] !== undefined)
      return 'product';

    const categoryKey = String(product.category || '')
      .trim()
      .toLowerCase();
    if (categoryKey && cfg.categoryRules[categoryKey] !== undefined)
      return 'category';

    if (this.isGlobalSaleActive(cfg, now)) return 'global';

    return 'none';
  }

  private getPercent(
    product: any,
    config?: SalesConfig,
    now = new Date(),
  ): number {
    const cfg = config || this.get();
    let percent = 0;

    if (this.isGlobalSaleActive(cfg, now)) {
      percent = this.safePercent(cfg.globalPercent);
    }

    const categoryKey = String(product.category || '')
      .trim()
      .toLowerCase();
    if (categoryKey && cfg.categoryRules[categoryKey] !== undefined) {
      percent = this.safePercent(cfg.categoryRules[categoryKey]);
    }

    const productKey = String(product.id || '').trim();
    if (productKey && cfg.productRules[productKey] !== undefined) {
      percent = this.safePercent(cfg.productRules[productKey]);
    }

    return percent;
  }

  applyToProduct(product: any, config?: SalesConfig, now = new Date()) {
    const percent = this.getPercent(product, config, now);
    const basePrice = Number(product.price || 0);

    if (!percent || basePrice <= 0) {
      return {
        ...product,
        originalPrice: basePrice,
        salePercent: 0,
        onSale: false,
        saleSource: this.getRuleSource(product, config, now),
      };
    }

    const discountedPrice = Math.max(
      0,
      Math.round((basePrice * (100 - percent)) / 100),
    );

    return {
      ...product,
      originalPrice: basePrice,
      price: discountedPrice,
      compareAt: basePrice,
      salePercent: percent,
      onSale: true,
      saleSource: this.getRuleSource(product, config, now),
    };
  }

  applyToMany(products: any[], config?: SalesConfig, now = new Date()) {
    return (products || []).map((p) => this.applyToProduct(p, config, now));
  }

  getPreviewRows(products: any[]) {
    return this.getPreviewRowsWithConfig(products, this.get());
  }

  async getPreviewRowsAsync(products: any[]) {
    return this.getPreviewRowsWithConfig(products, await this.getAsync());
  }

  getPreviewRowsWithConfig(products: any[], cfg: SalesConfig) {
    const now = new Date();

    return (products || []).map((product) => {
      const priced = this.applyToProduct(product, cfg, now);
      return {
        id: String(product.id || ''),
        title: String(product.title || ''),
        category: String(product.category || ''),
        originalPrice: Number(product.price || 0),
        finalPrice: Number(priced.price || 0),
        salePercent: Number(priced.salePercent || 0),
        onSale: !!priced.onSale,
        saleSource: priced.saleSource || 'none',
        timerActive: this.isGlobalSaleActive(cfg, now),
      };
    });
  }

  parseRules(text: string): Record<string, number> {
    const out: Record<string, number> = {};

    String(text || '')
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((line) => {
        const parts = line.split('=');
        if (parts.length < 2) return;

        const key = String(parts[0] || '')
          .trim()
          .toLowerCase();
        const value = this.safePercent(parts[1] || 0);

        if (!key) return;
        out[key] = value;
      });

    return out;
  }

  rulesToText(obj: Record<string, number>) {
    return Object.entries(obj || {})
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
  }

  getBannerState(settings: any) {
    return this.getBannerStateWithConfig(settings, this.get());
  }

  async getBannerStateAsync(settings: any) {
    return this.getBannerStateWithConfig(settings, await this.getAsync());
  }

  getBannerStateWithConfig(settings: any, cfg: SalesConfig) {
    const now = new Date();
    const active = this.isGlobalSaleActive(cfg, now);

    return {
      active,
      title: String(settings?.saleBannerTitle || 'Sale Live').trim(),
      text: String(settings?.saleBannerText || '').trim(),
      buttonText: String(
        settings?.saleBannerButtonText || 'Shop the Sale',
      ).trim(),
      timerEnabled: active && !!cfg.globalTimerEnabled && !!cfg.globalEndAt,
      endAt:
        active && cfg.globalTimerEnabled ? String(cfg.globalEndAt || '') : '',
      nowIso: now.toISOString(),
      percent: active ? this.safePercent(cfg.globalPercent) : 0,
    };
  }
}
