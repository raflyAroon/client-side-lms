import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/auth/login', '/auth/register', '/auth/verify-otp'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah path saat ini termasuk dalam publicPaths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};