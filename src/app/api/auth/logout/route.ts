import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

/**
 * Route Handler에서 로그아웃 처리
 *
 * POST /api/auth/logout
 * - 현재 세션을 종료하고 쿠키를 삭제
 * - HTTP-Only 쿠키가 자동으로 제거됨
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient()

    // 로그아웃 처리
    // Supabase가 자동으로 세션 쿠키를 제거함
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: '로그아웃 성공' })
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
