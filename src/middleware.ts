import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from './lib/supabase/server'

/**
 * Middleware에서 쿠키 기반 인증 처리 및 자동 토큰 갱신
 *
 * 동작 방식:
 * 1. createMiddlewareClient로 Supabase 클라이언트 생성
 * 2. HTTP-Only 쿠키에서 세션 읽기 (sb-vfktagkboaefkdrdljcq-auth-token)
 * 3. 세션이 갱신되면 자동으로 쿠키 업데이트
 * 4. Response 객체에 업데이트된 쿠키가 포함됨
 * 5. 관리자 경로는 admin role 체크
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 공개 경로 (인증 불필요)
  const publicPaths = ['/login', '/signup', '/']
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/products')

  // Middleware 전용 Supabase 클라이언트 생성
  // - req.cookies에서 세션 쿠키 읽기
  // - res.cookies에 갱신된 세션 쿠키 쓰기
  const { supabase, response } = createMiddlewareClient(req)

  // 세션 자동 갱신 (모든 요청에서 실행)
  // getUser()는 JWT를 검증하고, 필요시 자동으로 토큰을 갱신함
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 공개 경로이면서 로그인된 사용자인 경우, 세션만 갱신하고 통과
  if (isPublicPath) {
    return response
  }

  // admin 경로가 아니면 인증 체크만 하고 통과
  if (!pathname.startsWith('/admin')) {
    return response
  }

  // 이하 admin 경로 전용 로직

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 프로필 조회하여 is_admin 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  // is_admin이 true가 아닌 경우 접근 제한
  if (!profile || profile.is_admin !== true) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // 갱신된 쿠키가 포함된 response 반환
  // Supabase가 세션을 갱신했다면 새로운 쿠키가 자동으로 설정됨
  return response
}

export const config = {
  // 모든 경로에서 실행 (정적 파일 제외)
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}