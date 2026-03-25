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

export async function middleware(request: NextRequest) {
  const isAuthApi = request.nextUrl.pathname.startsWith('/api/auth')

  // OPTIONS preflight — /api/auth/* 만 처리
  if (request.method === 'OPTIONS' && isAuthApi) {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
  }

  // Supabase 세션 갱신 (쿠키 기반)
  const { supabase, response } = createMiddlewareClient(request)
  await supabase.auth.getUser()

  // /api/auth/* 응답에 CORS 헤더 추가
  if (isAuthApi) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}

export const config = {
  matcher: [
    // 정적 파일, 이미지, favicon 제외한 모든 경로
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
