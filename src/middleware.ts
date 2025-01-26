import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

// Add routes that don't require authentication
const publicRoutes = ['/auth'];

export async function middleware(req: NextRequest) {
  console.log('Middleware running, path:', req.nextUrl.pathname);

  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  try {
    // Try to refresh the session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log('Session check result:', error ? 'Error' : 'Success');
    console.log('Session status:', session ? 'Authenticated' : 'No session');

    const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

    if (!session && !isPublicRoute) {
      console.log('Redirecting to auth');
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    if (session && isPublicRoute) {
      console.log('Redirecting to home');
      return NextResponse.redirect(new URL('/', req.url));
    }

    return res;
  } catch (e) {
    console.error('Middleware error:', e);
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
