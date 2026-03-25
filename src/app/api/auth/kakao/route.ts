import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

/**
 * GET /api/auth/kakao
 * Framer에서 이 URL로 리다이렉트하면 카카오 OAuth 시작
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

  return NextResponse.redirect(data.url)
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
