import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {

  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {

    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });


    const sessionId = request.cookies.get('sessionId')?.value;
    

    if (token || sessionId) {
      console.log('Giriş yapmış kullanıcı login/register sayfasına erişmeye çalışıyor, feed sayfasına yönlendiriliyor');
      return NextResponse.redirect(new URL('/feed', request.url));
    }
  }


  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
      },
    })
  }

  const response = NextResponse.next()


  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (request.nextUrl.pathname.startsWith('/api/') && 
      (request.nextUrl.pathname.includes('/like') || 
       request.nextUrl.pathname.includes('/recommend'))) {
    const token = await getToken({ req: request })
    

    const authHeader = request.headers.get('authorization');
    const hasAuthHeader = authHeader && authHeader.startsWith('Bearer ');
    
    if (!token && !hasAuthHeader) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Yetkilendirme gerekli. Lütfen giriş yapın.' 
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...response.headers
          }
        }
      )
    }
    

    if (token && token.email) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-auth-email', token.email);
      if (token.sub) {
        requestHeaders.set('x-auth-user-id', token.sub);
      }
      
      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
    }
  }

  return response
}


export const config = {
  matcher: [
    /*
     * API rotaları için matcher
     * auth ve nextauth route'ları hariç tutuyoruz
     */
    '/((?!_next|api/auth).*)'
  ]
}
