import { NextResponse } from 'next/server';
import { SalesService } from '@/src/common/sales.service';
import { Storage } from '@/src/storage/storage.adapter';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const salesService = new SalesService();
    const products = await Storage.listProducts({ includeHidden: true });
    const sales = await salesService.getAsync();
    return NextResponse.json({
      ok: true,
      sales,
      preview: salesService.getPreviewRowsWithConfig(products, sales),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Sales data failed.',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const salesService = new SalesService();
    const sales = await salesService.saveAsync({
      globalEnabled: !!body?.globalEnabled,
      globalPercent: Number(body?.globalPercent || 0),
      globalTimerEnabled: !!body?.globalTimerEnabled,
      globalStartAt: String(body?.globalStartAt || ''),
      globalEndAt: String(body?.globalEndAt || ''),
      categoryRules: body?.categoryRules || {},
      productRules: body?.productRules || {},
    });
    const products = await Storage.listProducts({ includeHidden: true });

    return NextResponse.json({
      ok: true,
      sales,
      preview: salesService.getPreviewRowsWithConfig(products, sales),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Sales save failed.',
      },
      { status: 400 },
    );
  }
}
