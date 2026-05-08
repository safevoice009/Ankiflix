import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vanity URL redirects for smoother student persona flow
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  if (pathname === '/signup') {
    return NextResponse.redirect(new URL('/auth/login?mode=signup', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/signup'],
}
