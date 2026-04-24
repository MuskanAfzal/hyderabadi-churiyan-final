import { NextResponse } from 'next/server';
import { listOrders } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await listOrders();
    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Order list failed.',
      },
      { status: 500 },
    );
  }
}
