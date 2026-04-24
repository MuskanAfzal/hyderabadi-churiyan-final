import { NextResponse } from 'next/server';
import { AdminAuthService } from '@/src/common/admin-auth.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const currentPassword = String(body?.currentPassword || '');
    const newPassword = String(body?.newPassword || '');
    const confirmPassword = String(body?.confirmPassword || '');
    const username = String(body?.username || '').trim();

    if (!username || !currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { ok: false, error: 'Please fill in all password fields.' },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { ok: false, error: 'New password and confirmation do not match.' },
        { status: 400 },
      );
    }

    new AdminAuthService().changePassword({
      currentPassword,
      newPassword,
      username,
    });

    return NextResponse.json({
      ok: true,
      message: 'Admin password updated.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Password update failed.',
      },
      { status: 400 },
    );
  }
}
