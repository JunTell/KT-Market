import { NextResponse } from 'next/server'

import { createMiddlewareClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const publicPaths = ['/login', '/signup', '/']
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/products')

  const { supabase, response } = createMiddlewareClient(req)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isPublicPath) {
    return response
  }

  if (!pathname.startsWith('/admin')) {
    return response
  }

  if (!user) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile || profile.is_admin !== true) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}