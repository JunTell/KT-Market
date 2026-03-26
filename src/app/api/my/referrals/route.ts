import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseAdminClient } from '@/src/shared/lib/supabase/admin'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

/**
 * GET /api/my/referrals
 * 유저 지인 추천 내역 (referral_consultation.referrer_phone 기준, 최신순)
 */
export async function GET(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))

  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401, headers: cors })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .single()

    const phone = profile?.phone
    if (!phone) {
      return NextResponse.json([], { headers: cors })
    }

    const admin = createSupabaseAdminClient()

    const { data } = await admin
      .from('referral_consultation')
      .select(
        'id, created_at, buyer_name, buyer_phone, phone_model, join_type, need_phone_consult, need_internet_consult, is_processed, is_self_purchase, buyer_relation'
      )
      .eq('referrer_phone', phone)
      .order('created_at', { ascending: false })

    // buyer_phone 마스킹 (010-1234-5678 → 010-****-5678)
    const masked = (data ?? []).map((r) => ({
      ...r,
      buyer_phone: r.buyer_phone
        ? r.buyer_phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1-****-$2')
        : null,
    }))

    return NextResponse.json(masked, { headers: cors })
  } catch (error) {
    console.error('GET /api/my/referrals 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
