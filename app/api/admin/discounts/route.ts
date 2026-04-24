import { NextResponse } from 'next/server';
import { DiscountsService } from '@/src/common/discounts.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const discounts = await new DiscountsService().list();
    return NextResponse.json({ ok: true, discounts });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Discount list failed.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const discount = await new DiscountsService().create({
      code: String(body?.code || '').trim(),
      type: body?.type === 'fixed' ? 'fixed' : 'percent',
      value: Number(body?.value || 0),
      isActive: !!body?.isActive,
    });

    return NextResponse.json({ ok: true, discount });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Discount save failed.',
      },
      { status: 400 },
    );
  }
}
