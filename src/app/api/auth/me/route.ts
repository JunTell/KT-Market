import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

/**
 * GET /api/auth/me
 * Framer에서 주기적으로 호출하여 로그인 상태 및 유저 정보 확인
 *
 * 로그인:    { isLoggedIn: true,  user: { id, full_name, avatar_url, phone, kakao_id } }
 * 비로그인:  { isLoggedIn: false }
 */
export async function GET(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))

  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isLoggedIn: false }, { headers: cors })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, phone, kakao_id, birthday, is_active')
      .eq('id', user.id)
      .single()

    // 탈퇴 처리된 회원은 비로그인으로 응답
    if (profile?.is_active === false) {
      return NextResponse.json({ isLoggedIn: false }, { headers: cors })
    }

    return NextResponse.json(
      {
        isLoggedIn: true,
        user: {
          id: user.id,
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
          phone: profile?.phone ?? null,
          kakao_id: profile?.kakao_id ?? null,
          birthday: profile?.birthday ?? null,
        },
      },
      { headers: cors }
    )
  } catch (error) {
    console.error('GET /api/auth/me 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500, headers: cors }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
