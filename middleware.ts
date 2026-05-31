import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // Rate Limiting — max 150 requests per minute per IP
  if (!rateLimit(ip)) {
    return new NextResponse('Too Many Requests.', { status: 429 });
  }

  // Only protect admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === '/admin/login';

  // Check for NextAuth session cookie
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  // No session → redirect to login
  if (!sessionToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Has session + on login page → redirect to dashboard
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
