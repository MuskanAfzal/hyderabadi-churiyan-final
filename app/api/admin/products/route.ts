import { NextResponse } from 'next/server';
import { sanitizeProduct, uniqueProductId } from '@/lib/admin-api';
import type { ProductRecord } from '@/lib/storefront';
import { Storage } from '@/src/storage/storage.adapter';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await Storage.listProducts({ includeHidden: true });

    return NextResponse.json({
      ok: true,
      products,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Product list failed.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const products = (await Storage.listProducts({
      includeHidden: true,
    })) as ProductRecord[];
    const requestedId = String(body?.id || body?.title || 'product');
    const id = uniqueProductId(requestedId, products);
    const product = sanitizeProduct(body, null, id);
    const created = await Storage.createProduct(product);

    return NextResponse.json(
      {
        ok: true,
        product: created,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Product save failed.',
      },
      { status: 400 },
    );
  }
}
