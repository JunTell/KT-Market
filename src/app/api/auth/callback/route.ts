import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'
import { upsertProfile } from '@/src/shared/lib/upsertProfile'

import type { NextRequest } from 'next/server'

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRAMER_SITE_URL || 'https://ktmarket.co.kr'

/**
 * GET /api/auth/callback
 * 카카오 인증 완료 후 Supabase가 리다이렉트하는 콜백
 *
 * 1. URL searchParams에서 code 추출
 * 2. exchangeCodeForSession(code) → 세션 쿠키 발급
 * 3. upsertProfile() — profiles 테이블 동기화
 * 4. 302 redirect → https://ktmarket.co.kr/mypage
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    console.error('OAuth 인가 코드가 없습니다.')
    return NextResponse.redirect(`${FRONTEND_URL}/?login_error=true`)
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.user) {
      console.error('코드 교환 실패:', error)
      return NextResponse.redirect(`${FRONTEND_URL}/?login_error=true`)
    }

    // Supabase GoTrue는 phone_number/birthday/birthyear를 user_metadata에 저장하지 않으므로
    // provider_token(카카오 액세스 토큰)으로 카카오 API를 직접 호출해 추가 정보를 가져옴
    let kakaoExtra: { phone?: string; birthday?: string; birthyear?: string } =
      {}
    const providerToken = data.session?.provider_token
    if (providerToken) {
      try {
        const kakaoRes = await fetch('https://kapi.kakao.com/v2/user/me', {
          headers: { Authorization: `Bearer ${providerToken}` },
        })
        if (kakaoRes.ok) {
          const kakaoData = await kakaoRes.json()
          const account = kakaoData.kakao_account ?? {}
          kakaoExtra = {
            phone: account.phone_number ?? undefined,
            birthday: account.birthday ?? undefined,
            birthyear: account.birthyear ?? undefined,
          }
        } else {
          console.error('카카오 사용자 정보 조회 실패:', kakaoRes.status)
        }
      } catch (e) {
        console.error('카카오 추가 정보 조회 오류:', e)
      }
    }

    // profiles 테이블 upsert (신규 가입 + 기존 회원 정보 갱신)
    try {
      await upsertProfile(supabase, data.user, kakaoExtra)
    } catch (profileError) {
      // 프로필 upsert 실패는 로그인 자체를 막지 않음
      console.error('프로필 upsert 실패 (로그인은 계속):', profileError)
    }

    // 로그인 전 저장된 리다이렉트 경로 확인 (kakao/route.ts에서 설정)
    const postAuthRedirect = request.cookies.get('post_auth_redirect')?.value
    const finalRedirectUrl = postAuthRedirect
      ? `${FRONTEND_URL}${postAuthRedirect}`
      : `${FRONTEND_URL}/mypage`

    const successResponse = NextResponse.redirect(finalRedirectUrl)
    successResponse.cookies.delete('post_auth_redirect')
    return successResponse
  } catch (err) {
    console.error('콜백 처리 오류:', err)
    return NextResponse.redirect(`${FRONTEND_URL}/?login_error=true`)
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
