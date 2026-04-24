import { NextResponse } from 'next/server';
import { DiscountsService } from '@/src/common/discounts.service';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params;
    await new DiscountsService().remove(decodeURIComponent(code));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Discount delete failed.',
      },
      { status: 400 },
    );
  }
}
