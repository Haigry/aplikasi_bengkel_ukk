import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (path.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (path.startsWith('/karyawan') && token?.role !== 'KARYAWAN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (path.startsWith('/customer') && token?.role !== 'CUSTOMER') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/karyawan/:path*',
    '/customer/:path*',
    '/booking/:path*'
  ]
};
