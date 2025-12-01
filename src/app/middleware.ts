import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '../lib/supabase/server'

/**
 * Middleware에서 쿠키 기반 인증 처리
 *
 * 동작 방식:
 * 1. createMiddlewareClient로 Supabase 클라이언트 생성
 * 2. HTTP-Only 쿠키에서 세션 읽기 (sb-...-auth-token)
 * 3. 세션이 갱신되면 자동으로 쿠키 업데이트
 * 4. Response 객체에 업데이트된 쿠키가 포함됨
 */
export async function middleware(req: NextRequest) {
  // admin 경로가 아니면 인증 체크 생략
  if (!req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Middleware 전용 Supabase 클라이언트 생성
  // - req.cookies에서 세션 쿠키 읽기
  // - res.cookies에 갱신된 세션 쿠키 쓰기
  const { supabase, response } = createMiddlewareClient(req)

  // 쿠키에서 사용자 정보 가져오기
  // getUser()는 JWT를 검증하고 사용자 정보를 반환
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 프로필 조회하여 role 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // role이 admin이 아닌 경우 접근 제한
  if (!profile || profile.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // 갱신된 쿠키가 포함된 response 반환
  // Supabase가 세션을 갱신했다면 새로운 쿠키가 자동으로 설정됨
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}