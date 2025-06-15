import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';


const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/me',
  '/api/auth/logout',
  '/api/poems/trending',
  '/api/poems$',
  '/api/poems/',
  '/_next',
  '/favicon.ico',
  '/vercel.svg',
  '/globe.svg',
  '/file.svg',
  '/window.svg',
];


const HOME_PATHS = [
  '/',
  '/login',
  '/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  try {

    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    

    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                        request.cookies.get('__Secure-next-auth.session-token')?.value;
    
    const isAuthenticated = !!token && !!token.email;
    

    if (pathname.includes('/login') || pathname.includes('/feed')) {
      console.log('Middleware debug:', {
        pathname,
        hasToken: !!token,
        tokenEmail: token?.email,
        sessionToken: !!sessionToken,
        isAuthenticated
      });
    }


    if (pathname.includes('/api') && 
        !PUBLIC_PATHS.some(path => pathname.startsWith(path) || pathname === path)) {
      
      if (!isAuthenticated) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: 'Yetkilendirme gerekli. Lütfen giriş yapın.',
            status: 'unauthorized'
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'WWW-Authenticate': 'Bearer',
            }
          }
        );
      }
      

      const requestHeaders = new Headers(request.headers);
      if (token?.email) {
        requestHeaders.set('x-auth-email', token.email);
        requestHeaders.set('x-auth-user-id', token.sub as string);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
    }
    

    

    if (isAuthenticated && HOME_PATHS.some(path => pathname === path)) {
      console.log(`Giriş yapılmış, ${pathname} sayfasına erişim engellendi. /feed'e yönlendiriliyor.`);
      return NextResponse.redirect(new URL('/feed', request.url));
    }
    

    if (!isAuthenticated && !PUBLIC_PATHS.some(path => 
        pathname === path || 
        pathname.startsWith(path) || 
        pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|ico|svg)$/))) {
      console.log(`Giriş yapılmamış, ${pathname} sayfasına erişim engellendi. /login'e yönlendiriliyor.`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    

    if (pathname.includes('/api')) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Yetkilendirme işlemi sırasında bir hata oluştu.',
          status: 'error'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    

    if (!PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
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
