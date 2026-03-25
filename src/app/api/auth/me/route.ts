import { NextResponse } from 'next/server'

import { corsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

/**
 * 010-1234-5678 → 010-****-5678
 */
function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1-****-$2')
}

/**
 * GET /api/auth/me
 * Framer에서 주기적으로 호출하여 로그인 상태 및 유저 정보 확인
 *
 * 로그인:    { isLoggedIn: true,  user: { id, full_name, avatar_url, phone(마스킹), kakao_id } }
 * 비로그인:  { isLoggedIn: false }
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isLoggedIn: false }, { headers: corsHeaders() })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, phone, kakao_id')
      .eq('id', user.id)
      .single()

    return NextResponse.json(
      {
        isLoggedIn: true,
        user: {
          id: user.id,
          full_name: profile?.full_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
          phone: maskPhone(profile?.phone),
          kakao_id: profile?.kakao_id ?? null,
        },
      },
      { headers: corsHeaders() }
    )
  } catch (error) {
    console.error('GET /api/auth/me 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}
