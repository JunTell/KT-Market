import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

// 로그인 후 리다이렉트할 경로로 허용된 패턴 (상대 경로만 허용)
const ALLOWED_REDIRECT_RE = /^\/[a-zA-Z0-9_\-/]*$/

/**
 * GET /api/auth/kakao
 * Framer에서 이 URL로 리다이렉트하면 카카오 OAuth 시작
 *
 * ?redirect=/phone/user-info 를 전달하면 로그인 완료 후 해당 경로로 이동
 */
export async function GET(request: NextRequest) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || request.nextUrl.origin
  const frontendUrl =
    process.env.NEXT_PUBLIC_FRAMER_SITE_URL || 'https://ktmarket.co.kr'

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${apiUrl}/api/auth/callback`,
      scopes:
        'profile_nickname profile_image account_email name phone_number birthday birthyear',
    },
  })

  if (error || !data?.url) {
    console.error('카카오 OAuth URL 생성 실패:', error)
    return NextResponse.redirect(`${frontendUrl}/?error=kakao_auth_failed`)
  }

  const response = NextResponse.redirect(data.url)

  // 로그인 후 돌아올 경로를 쿠키에 저장 (OAuth 플로우 동안 유지)
  const redirect = request.nextUrl.searchParams.get('redirect')
  if (redirect && ALLOWED_REDIRECT_RE.test(redirect)) {
    response.cookies.set('post_auth_redirect', redirect, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10분
      path: '/',
    })
  }

  return response
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
