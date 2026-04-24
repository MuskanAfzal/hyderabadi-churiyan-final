import { NextResponse } from 'next/server';
import { sanitizeSettings } from '@/lib/admin-api';
import { SettingsService } from '@/src/common/settings.service';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const settingsService = new SettingsService();
    const current = await settingsService.getAsync();
    const settings = await settingsService.updateAsync(
      sanitizeSettings(body, current),
    );

    return NextResponse.json({
      ok: true,
      settings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Website content save failed.',
      },
      { status: 400 },
    );
  }
}
