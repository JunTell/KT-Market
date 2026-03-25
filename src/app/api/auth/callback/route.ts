import { NextResponse } from 'next/server'

import { upsertProfile } from '@/src/shared/lib/upsertProfile'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

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

    // profiles 테이블 upsert (신규 가입 + 기존 회원 정보 갱신)
    try {
      await upsertProfile(supabase, data.user)
    } catch (profileError) {
      // 프로필 upsert 실패는 로그인 자체를 막지 않음
      console.error('프로필 upsert 실패 (로그인은 계속):', profileError)
    }

    return NextResponse.redirect(`${FRONTEND_URL}/mypage`)
  } catch (err) {
    console.error('콜백 처리 오류:', err)
    return NextResponse.redirect(`${FRONTEND_URL}/?login_error=true`)
  }
}
