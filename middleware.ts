import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Secret Gate Token ──
// Admin panel is ONLY accessible if this token is present as ?gate=TOKEN
// Anyone visiting /admin/login directly (without the secret key) gets a 404.
const ADMIN_GATE_TOKEN  = 'Px9mZ7kQrNw3Jt8vS2026Lx';
const ADMIN_GATE_COOKIE = 'pxl_adm_gate';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // Basic Rate Limiting Check (Limits to ~150 requests per minute per IP per isolate)
  const isAllowed = rateLimit(ip);
  if (!isAllowed) {
    return new NextResponse('Too Many Requests. Please calm down.', { status: 429 });
  }

  // ── Only guard admin routes ──
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === '/admin/login';

  // ── Gate Token Layer ──
  if (isLoginPage) {
    const gateParam  = request.nextUrl.searchParams.get('gate');
    const gateCookie = request.cookies.get(ADMIN_GATE_COOKIE)?.value;

    if (gateParam === ADMIN_GATE_TOKEN) {
      // Valid gate key — set cookie and allow through to the login page
      const response = NextResponse.next();
      response.cookies.set(ADMIN_GATE_COOKIE, ADMIN_GATE_TOKEN, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 4, // 4 hours
        path: '/admin',
      });
      return response;
    }

    // No valid gate param AND no valid gate cookie → silently redirect to homepage (looks like 404)
    if (gateCookie !== ADMIN_GATE_TOKEN) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ── Session Token Layer ──
  // Check for next-auth session cookie
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  // No session → send to login (unless already there)
  if (!sessionToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Has session + on login page → send to dashboard
  if (sessionToken && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

// ── Simple In-Memory Rate Limiter ──
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
