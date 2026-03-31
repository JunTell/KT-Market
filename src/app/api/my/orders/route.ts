import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseAdminClient } from '@/src/shared/lib/supabase/admin'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

/**
 * GET /api/my/orders
 * 유저 주문 내역 (online_order + iphone17_order + s26_orders + call_order, datetime 최신순)
 * - online_order / iphone17_order / s26_orders: profile_id 기준
 * - call_order: profile_id 컬럼 없음 → profiles.phone 기준
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

    const admin = createSupabaseAdminClient()

    // phone 조회와 profile_id 기반 쿼리를 병렬 실행
    const [profileRes, onlineRes, iphone17Res, s26Res] = await Promise.all([
      supabase.from('profiles').select('phone').eq('id', user.id).single(),
      admin
        .from('online_order')
        .select('no, datetime, device, model, "petName", capacity, color, plan, register, discount, installment, benefit, is_processed, carrier')
        .eq('profile_id', user.id)
        .order('datetime', { ascending: false }),
      admin
        .from('iphone17_order')
        .select('no, datetime, model, pet_name, capacity, color, plan, register, discount, installment, benefit, is_processed, carrier')
        .eq('profile_id', user.id)
        .order('datetime', { ascending: false }),
      admin
        .from('s26_orders')
        .select('no, datetime, device, model, "petName", capacity, color, plan, register, discount, installment, benefit, is_processed, carrier')
        .eq('profile_id', user.id)
        .order('datetime', { ascending: false }),
    ])

    // call_order는 phone 기준 (profile_id 컬럼 없음)
    const phone = profileRes.data?.phone ?? null
    const callRes = phone
      ? await admin
          .from('call_order')
          .select('no, datetime, device, model, "petName", capacity, color, plan, register, discount, installment, benefit, is_processed, carrier')
          .eq('phone', phone)
          .order('datetime', { ascending: false })
      : { data: [] }

    const online = (onlineRes.data ?? []).map((r) => ({ ...r, source: 'online' as const }))
    const iphone17 = (iphone17Res.data ?? []).map(({ pet_name, ...r }) => ({
      ...r,
      petName: pet_name,
      source: 'iphone17' as const,
    }))
    const call = (callRes.data ?? []).map((r) => ({ ...r, source: 'call' as const }))
    const s26 = (s26Res.data ?? []).map((r) => ({ ...r, source: 's26' as const }))

    const merged = [...online, ...iphone17, ...call, ...s26].sort(
      (a, b) => new Date(b.datetime ?? 0).getTime() - new Date(a.datetime ?? 0).getTime()
    )

    return NextResponse.json(merged, { headers: cors })
  } catch (error) {
    console.error('GET /api/my/orders 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
