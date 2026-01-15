import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

/**
 * Route Handler에서 쿠키 기반 인증 사용 예시
 *
 * GET /api/auth/me
 * - 현재 로그인한 사용자 정보를 반환
 * - 쿠키에서 세션을 읽어서 인증 확인
 * - HTTP-Only 쿠키로 보안 유지
 */
export async function GET() {
  try {
    // Route Handler에서 createSupabaseServerClient 사용
    // cookies().get/set을 통해 HTTP-Only 쿠키 접근
    const supabase = await createSupabaseServerClient()

    // 쿠키에서 사용자 정보 가져오기
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      )
    }

    // 프로필 정보 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: '프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 사용자 정보 반환
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
