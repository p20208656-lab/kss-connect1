import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes ที่ต้องการ authentication ของนักเรียน
const studentProtectedRoutes = ['/dashboard', '/messages', '/calendar', '/report', '/ai'];

// Routes ที่ต้องการ authentication ของแอดมิน
const adminProtectedRoutes = ['/admin'];

// Routes ที่ต้องการ authentication ของครู
const teacherProtectedRoutes = ['/teacher'];

// Routes ที่ไม่ต้องการ authentication
const publicRoutes = ['/', '/admin/login', '/teacher/login'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip API routes และ static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  const userCookie = request.cookies.get('kss_user')?.value;
  const adminCookie = request.cookies.get('kss_admin')?.value;
  const teacherCookie = request.cookies.get('kss_teacher')?.value;

  // Check student protected routes
  if (studentProtectedRoutes.some(route => pathname.startsWith(route))) {
    if (!userCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Check admin protected routes
  if (adminProtectedRoutes.some(route => pathname.startsWith(route)) && pathname !== '/admin/login') {
    if (!adminCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Check teacher protected routes
  if (teacherProtectedRoutes.some(route => pathname.startsWith(route)) && pathname !== '/teacher/login') {
    if (!teacherCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/teacher/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from login pages
  if (pathname === '/' && userCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (pathname === '/admin/login' && adminCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  if (pathname === '/teacher/login' && teacherCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/teacher';
    return NextResponse.redirect(url);
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
