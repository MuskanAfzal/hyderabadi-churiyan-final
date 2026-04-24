import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await updateOrderStatus(id, String(body?.status || 'New'));

    return NextResponse.json(result, { status: result.ok ? 200 : 404 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Order status update failed.',
      },
      { status: 400 },
    );
  }
}
