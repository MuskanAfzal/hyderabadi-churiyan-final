import { NextResponse } from 'next/server';
import { AdminAuthService } from '@/src/common/admin-auth.service';

const ADMIN_COOKIE = 'hc_admin_session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body?.username || '').trim();
  const password = String(body?.password || '');
  const authService = new AdminAuthService();

  if (!authService.verify(username, password)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid admin username or password.' },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: process.env.SESSION_SECRET || 'admin-session',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
