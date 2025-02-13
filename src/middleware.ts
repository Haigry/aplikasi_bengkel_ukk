import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Jika tidak ada token, redirect ke login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based access control
    if (
      (path.startsWith('/admin') && token.role !== 'ADMIN') ||
      (path.startsWith('/karyawan') && token.role !== 'KARYAWAN') ||
      (path.startsWith('/customer') && token.role !== 'CUSTOMER')
    ) {
      // Redirect berdasarkan role
      switch (token.role) {
        case 'ADMIN':
          return NextResponse.redirect(new URL('/admin', req.url));
        case 'KARYAWAN':
          return NextResponse.redirect(new URL('/karyawan', req.url));
        case 'CUSTOMER':
          return NextResponse.redirect(new URL('/customer', req.url));
        default:
          return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
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
