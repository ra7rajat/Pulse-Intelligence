import { NextResponse } from 'next/server';

/**
 * PulseStadium V2 Edge Security Middleware
 * CSP configured to allow Google Maps WebGL Vector API + Firebase resources.
 */
export function middleware() {
  const response = NextResponse.next();

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com;
    object-src 'none';
    base-uri 'self';
    connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.google.com https://*.gstatic.com wss://*.firebaseio.com;
    img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.ggpht.com https://*.googleusercontent.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' data: https://fonts.gstatic.com;
    worker-src 'self' blob:;
    frame-src https://*.google.com https://*.googleapis.com;
    frame-ancestors 'none';
    block-all-mixed-content;
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), fullscreen=(self), interest-cohort=()');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)'],
};
