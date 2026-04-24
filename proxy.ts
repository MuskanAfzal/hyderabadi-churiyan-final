import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE = 'hc_admin_session';

function isAuthed(request: NextRequest) {
  const expected = process.env.SESSION_SECRET || 'admin-session';
  return request.cookies.get(ADMIN_COOKIE)?.value === expected;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  const isAuthRoute =
    pathname === '/admin/login' || pathname.startsWith('/api/admin/auth');

  if ((!isAdminPage && !isAdminApi) || isAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthed(request)) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json(
      { ok: false, error: 'Admin login required.' },
      { status: 401 },
    );
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
