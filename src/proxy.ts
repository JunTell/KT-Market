import { NextResponse } from 'next/server'

import { createMiddlewareClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

const ALLOWED_ORIGIN =
  process.env.NEXT_PUBLIC_FRAMER_SITE_URL || 'https://ktmarket.co.kr'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAuthApi = pathname.startsWith('/api/auth')

  // OPTIONS preflight — /api/auth/* 만 처리
  if (req.method === 'OPTIONS' && isAuthApi) {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
  }

  // Supabase 세션 갱신 (쿠키 기반)
  const { supabase, response } = createMiddlewareClient(req)
  await supabase.auth.getUser()

  // /api/auth/* 응답에 CORS 헤더 추가
  if (isAuthApi) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // 공개 경로 — 인증 불필요
  const publicPaths = ['/login', '/signup', '/']
  const isPublicPath =
    publicPaths.includes(pathname) || pathname.startsWith('/products')

  if (isPublicPath) {
    return response
  }

  // 어드민 외 경로 — 인증 불필요
  if (!pathname.startsWith('/admin')) {
    return response
  }

  // /admin/* 경로 — 로그인 + 관리자 권한 검증
  // getUser()는 위에서 이미 호출했으므로 캐시된 결과 재사용
  const { data: { user } } = await supabase.auth.getUser()

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
