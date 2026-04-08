import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;
    
    // Define public paths that don't require authentication
    const publicPaths = [
      '/',  // Home page
      '/auth/login',
      '/auth/register',
      '/api/exams/validate',  // Allow exam validation without auth
      '/api/exams/public',    // Allow public exam endpoints
      '/api/auth',            // Auth API routes
    ];

    // Check if current path is public
    const isPublicPath = publicPaths.some(publicPath => 
      pathname === publicPath || pathname.startsWith(publicPath)
    );

    // Define role-based pages
    const isAuthPage = pathname.startsWith('/auth');
    const isAdminPage = pathname.startsWith('/admin');
    const isLecturerPage = pathname.startsWith('/lecturer');
    const isStudentPage = pathname.startsWith('/student');

    // PUBLIC PATH HANDLING
    if (isPublicPath) {
      // Allow access to public paths without authentication
      if (pathname.startsWith('/api/exams/validate')) {
        console.log('=== Public exam validation access ===');
        console.log('Path:', pathname);
        console.log('Code:', req.nextUrl.searchParams.get('code'));
        // Allow access - no authentication required
        return NextResponse.next();
      }
      
      // If user is authenticated and tries to access auth pages, redirect
      if (isAuth && isAuthPage) {
        if (token.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin', req.url));
        } else if (token.role === 'LECTURER') {
          return NextResponse.redirect(new URL('/lecturer', req.url));
        } else {
          return NextResponse.redirect(new URL('/student', req.url));
        }
      }
      
      // Allow access to other public paths
      return NextResponse.next();
    }

    // AUTHENTICATION CHECK (for non-public paths)
    if (!isAuth) {
      // Redirect unauthenticated users to login
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // ROLE-BASED ACCESS CONTROL
    if (isAdminPage && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (isLecturerPage && token.role !== 'LECTURER') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (isStudentPage && token.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Allow access for authenticated users with correct role
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Define public paths
        const publicPaths = [
          '/',
          '/auth/login',
          '/auth/register',
          '/api/exams/validate',
          '/api/exams/public',
          '/api/auth',
        ];
        
        // Check if path is public
        const isPublicPath = publicPaths.some(publicPath => 
          pathname === publicPath || pathname.startsWith(publicPath)
        );
        
        // Allow public paths without token
        if (isPublicPath) {
          return true;
        }
        
        // For protected paths, require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};