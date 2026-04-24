import { NextResponse } from 'next/server';
import { sanitizeProduct } from '@/lib/admin-api';
import type { ProductRecord } from '@/lib/storefront';
import { Storage } from '@/src/storage/storage.adapter';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const product = (await Storage.getProductById(id)) as ProductRecord | null;

    if (!product) {
      return NextResponse.json(
        { ok: false, error: 'Product not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Product lookup failed.',
      },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const current = (await Storage.getProductById(id)) as ProductRecord | null;

    if (!current) {
      return NextResponse.json(
        { ok: false, error: 'Product not found' },
        { status: 404 },
      );
    }

    const product = sanitizeProduct(body, current, id);
    const updated = await Storage.updateProduct(id, product);

    return NextResponse.json({
      ok: true,
      product: updated,
    });
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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const deleted = await Storage.deleteProduct(id);

    return NextResponse.json({
      ok: deleted,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Product delete failed.',
      },
      { status: 400 },
    );
  }
}
