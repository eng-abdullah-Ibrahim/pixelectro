import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Secret Entry Path & Gate ──────────────────────────────────────────────────
// ONLY this path grants access to the admin panel.
// Visiting /admin/login directly shows the homepage (no error, no hint).
const SECRET_ENTRY  = '/pxl-studio-9x7k2';   // The hidden URL you visit
const GATE_COOKIE   = 'pxl_sg';              // Cookie name (obscure)
const GATE_VALUE    = 'k9Px2mZ7qRnW3vS8jT'; // Cookie value (secret)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // Rate Limiting — max 150 requests per minute per IP
  if (!rateLimit(ip)) {
    return new NextResponse('Too Many Requests.', { status: 429 });
  }

  // ── Secret Entry Point ────────────────────────────────────────────────────
  // When the hidden URL is visited → set gate cookie → redirect to login page
  if (pathname === SECRET_ENTRY) {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.set(GATE_COOKIE, GATE_VALUE, {
      httpOnly: true,
      secure:   true,
      sameSite: 'strict',
      maxAge:   60 * 60 * 6, // valid for 6 hours
      path:     '/',
    });
    return response;
  }

  // ── Guard all /admin/* routes ─────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const gateCookie = request.cookies.get(GATE_COOKIE)?.value;

    // No gate cookie → silently redirect to homepage (visitor has no clue /admin exists)
    if (gateCookie !== GATE_VALUE) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const isLoginPage = pathname === '/admin/login';

    // Check for NextAuth session cookie
    const sessionToken =
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    // Gate passed but no session → show login page
    if (!sessionToken && !isLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Gate passed + has session + on login page → go to dashboard
    if (sessionToken && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};

// ── In-Memory Rate Limiter ────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 150;
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
    return true;
  }
  record.count++;
  return record.count <= maxRequests;
}
