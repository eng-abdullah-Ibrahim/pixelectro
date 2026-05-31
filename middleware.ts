import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // Basic Rate Limiting Check (Limits to ~100 requests per minute per IP per isolate)
  const isAllowed = rateLimit(ip);
  if (!isAllowed) {
    return new NextResponse('Too Many Requests. Please calm down.', { status: 429 });
  }

  // Only guard admin routes

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === '/admin/login';

  // Check for next-auth session cookie (works with both JWT and DB sessions)
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Apply to all routes except static assets
};

// ── Simple In-Memory Rate Limiter ──
// Note: In serverless environments, this state is per-isolate and can reset,
// but it is still highly effective for stopping aggressive localized bursts and
// works perfectly in a standard VPS/Node deployment.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 150; // max 150 requests per minute

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
  if (record.count > maxRequests) {
    return false;
  }

  return true;
}
