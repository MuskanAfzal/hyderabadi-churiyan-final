import { NextResponse } from 'next/server';
import { SettingsService } from '@/src/common/settings.service';
import { Storage } from '@/src/storage/storage.adapter';
import type { ProductRecord } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settingsService = new SettingsService();
    const products = (await Storage.listProducts({
      includeHidden: true,
    })) as ProductRecord[];

    const categories = Array.from(
      new Set(products.map((product) => product.category).filter(Boolean)),
    ).sort();
    const sizes = Array.from(
      new Set(
        products.flatMap((product) => product.sizes || []).filter(Boolean),
      ),
    ).sort();
    const colors = Array.from(
      new Set(
        products.flatMap((product) => product.colors || []).filter(Boolean),
      ),
    ).sort();
    const materials = Array.from(
      new Set(
        products.flatMap((product) => product.materials || []).filter(Boolean),
      ),
    ).sort();

    return NextResponse.json({
      ok: true,
      settings: await settingsService.getAsync(),
      products,
      catalog: {
        categories,
        sizes,
        colors,
        materials,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Admin snapshot failed.',
      },
      { status: 500 },
    );
  }
}
