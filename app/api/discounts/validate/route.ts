import { NextResponse } from 'next/server';
import { validateDiscount } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json();
  const data = await validateDiscount(
    String(body?.code || ''),
    Number(body?.subtotal || 0),
  );
  return NextResponse.json(data);
}
