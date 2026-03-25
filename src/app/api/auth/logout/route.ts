import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

/**
 * POST /api/auth/logout
 * 로그아웃 — 세션 쿠키 삭제
 * Framer에서 fetch({ method: 'POST', credentials: 'include' })로 호출 후
 * 클라이언트 측에서 메인 페이지로 리다이렉트 처리
 */
export async function POST(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: cors }
      )
    }

    return NextResponse.json({ success: true }, { headers: cors })
  } catch (error) {
    console.error('로그아웃 오류:', error)
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
