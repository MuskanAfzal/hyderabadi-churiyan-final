import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createOrder(body || {});
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Order failed',
      },
      { status: 400 },
    );
  }
}
