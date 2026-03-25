import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createMiddlewareClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Rate limiting — IP별 슬라이딩 윈도우
// Vercel serverless 환경에서 인스턴스 재시작 시 초기화되지만 burst 공격 방어 가능
// ---------------------------------------------------------------------------
interface RateLimitEntry {
  count: number
  windowStart: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const RATE_LIMIT_RULES: Record<string, { max: number; windowMs: number }> = {
  '/api/auth/kakao':    { max: 10,  windowMs: 60_000 },  // 1분에 10회 (OAuth 시작)
  '/api/auth/me':       { max: 60,  windowMs: 60_000 },  // 1분에 60회 (상태 폴링)
  '/api/auth/logout':   { max: 10,  windowMs: 60_000 },  // 1분에 10회
  '/api/auth/withdraw': { max: 3,   windowMs: 60_000 },  // 1분에 3회 (탈퇴)
  '/api/auth/callback': { max: 20,  windowMs: 60_000 },  // 1분에 20회 (OAuth 콜백)
}

function checkRateLimit(ip: string, pathname: string): boolean {
  const rule = RATE_LIMIT_RULES[pathname]
  if (!rule) return true

  const key = `${ip}:${pathname}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now - entry.windowStart > rule.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= rule.max) return false

  entry.count++
  return true
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAuthApi = pathname.startsWith('/api/auth')

  // Rate limiting — /api/auth/* 경로만 적용 (OPTIONS preflight 제외)
  if (isAuthApi && req.method !== 'OPTIONS') {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'
    const cors = getCorsHeaders(req.headers.get('origin'))
    if (!checkRateLimit(ip, pathname)) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429, headers: { ...cors, 'Retry-After': '60' } }
      )
    }
  }

  // OPTIONS preflight — /api/auth/* 만 처리
  if (req.method === 'OPTIONS' && isAuthApi) {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(req.headers.get('origin')),
    })
  }

  // Supabase 세션 갱신 (쿠키 기반)
  const { supabase, response } = createMiddlewareClient(req)
  await supabase.auth.getUser()

  // /api/auth/* 응답에 CORS 헤더 추가
  if (isAuthApi) {
    const corsHeaders = getCorsHeaders(req.headers.get('origin'))
    Object.entries(corsHeaders).forEach(([key, value]) => {
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
