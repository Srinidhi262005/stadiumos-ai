import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Identify protected routing folders
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/digital-twin') ||
    pathname.startsWith('/crowd') ||
    pathname.startsWith('/incidents') ||
    pathname.startsWith('/volunteers') ||
    pathname.startsWith('/accessibility') ||
    pathname.startsWith('/sustainability') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings');

  // Read session validation cookie (fastpath for Supabase/FastAPI validation)
  const sessionToken = request.cookies.get('stadium_session')?.value;

  // Secure route redirection check (template bypass enabled for local dev/testing)
  if (isProtectedRoute && !sessionToken) {
    // In production environment, enforce redirect
    if (process.env.NODE_ENV === 'production') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (backend api hooks)
     * - _next/static (static files bundle)
     * - _next/image (images optimization loader)
     * - favicon.ico (favicon assets)
     * - login (auth page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
