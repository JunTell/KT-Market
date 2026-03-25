import { NextResponse } from 'next/server'

import { corsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

/**
 * POST /api/auth/logout
 * 로그아웃 — 세션 쿠키 삭제
 * Framer에서 fetch({ method: 'POST', credentials: 'include' })로 호출 후
 * 클라이언트 측에서 메인 페이지로 리다이렉트 처리
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error('로그아웃 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}
