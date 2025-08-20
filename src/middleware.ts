import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy stricte
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' data: https: blob:",
    "connect-src 'self' https: wss: ws:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // Protection CSRF pour les API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Vérifier l'origine pour les requêtes POST/PUT/DELETE
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      if (!origin || !host || !origin.includes(host)) {
        // Permettre les requêtes locales en développement
        if (process.env.NODE_ENV === 'development' && 
            (origin?.includes('localhost') || origin?.includes('127.0.0.1'))) {
          return response;
        }
        
        return new NextResponse('CSRF Protection: Invalid origin', { status: 403 });
      }
    }
  }

  // Rate limiting basique (en mémoire - pour production utiliser Redis)
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimitKey = `${ip}-${request.nextUrl.pathname}`;
  
  // Stocker les tentatives en mémoire (remplacer par Redis en production)
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }
  
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = request.nextUrl.pathname.startsWith('/api/auth') ? 5 : 100;
  
  const requests = global.rateLimitStore.get(rateLimitKey) || [];
  const validRequests = requests.filter((time: number) => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  validRequests.push(now);
  global.rateLimitStore.set(rateLimitKey, validRequests);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

// Déclaration globale pour TypeScript
declare global {
  var rateLimitStore: Map<string, number[]> | undefined;
}
