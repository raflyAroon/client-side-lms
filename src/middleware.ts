// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Halaman yang boleh diakses tanpa login (public)
const publicPaths = ['/', '/auth/login', '/auth/register', '/verify-otp'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lewati jika halaman publik
  if (publicPaths.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Cek token di cookie (sesuai dengan backend yang set cookie 'auth_token')
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    // Redirect ke login jika tidak ada token dan bukan halaman publik
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};