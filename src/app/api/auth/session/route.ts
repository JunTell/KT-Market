import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest} from 'next/server';

/**
 * POST /api/auth/session
 * 클라이언트에서 로그인 후 서버에 세션을 동기화하는 API
 * 클라이언트의 세션 토큰을 받아서 서버 쿠키에 설정
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // 현재 세션 가져오기 (클라이언트에서 설정한 토큰 기반)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: '세션이 없습니다.' },
        { status: 401 }
      )
    }

    // 세션이 서버 쿠키에 제대로 설정되었는지 확인
    return NextResponse.json({
      success: true,
      user: session.user
    })
  } catch (error) {
    console.error('Session sync error:', error)
    return NextResponse.json(
      { error: '세션 동기화 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
