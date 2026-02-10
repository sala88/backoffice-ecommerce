import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, verifyToken } from '../lib/auth';

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Routes che non richiedono autenticazione
  const publicRoutes = ['/', '/login', '/api/auth/login', '/api/auth/register', '/api/health', '/docs', '/api/swagger.json'];

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Per tutte le altre route, verifica il token
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
