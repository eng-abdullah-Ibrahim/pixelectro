import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DASHBOARD_PATH = '/pxl-studio-9x7k2';
const LOGIN_PATH = '/pxl-studio-9x7k2/login';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // Rate Limiting — max 150 requests per minute per IP
  if (!rateLimit(ip)) {
    return new NextResponse('Too Many Requests.', { status: 429 });
  }

  // ── Legacy /admin redirect → silently send to new dashboard path ───────
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  // Guard all /pxl-studio-9x7k2 routes
  if (pathname.startsWith(DASHBOARD_PATH)) {
    const isLoginPage = pathname === LOGIN_PATH;

    // Check for NextAuth session cookie
    const sessionToken =
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    // No session → show login page
    if (!sessionToken && !isLoginPage) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }

    // Has session + on login page → go to dashboard
    if (sessionToken && isLoginPage) {
      return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

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
