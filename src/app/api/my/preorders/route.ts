import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseAdminClient } from '@/src/shared/lib/supabase/admin'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

/**
 * GET /api/my/preorders
 * 유저 사전예약 내역 (preorder_s26_orders + preorder-galaxy26 + preorder_iphone17e, 최신순)
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

    const [s26Res, galaxy26Res, iphone17eRes] = await Promise.all([
      admin
        .from('preorder_s26_orders')
        .select('no, datetime, device, model, petName, capacity, color, plan, register, is_processed, carrier')
        .eq('phone', phone)
        .order('datetime', { ascending: false }),
      admin
        .from('preorder-galaxy26')
        .select('id, created_at, model, mobile_carrier, color, is_processed, funnel')
        .eq('phone', phone)
        .order('created_at', { ascending: false }),
      admin
        .from('preorder_iphone17e')
        .select('id, created_at, model, mobile_carrier, status')
        .eq('phone', phone)
        .order('created_at', { ascending: false }),
    ])

    // 통일된 형태로 변환
    const s26 = (s26Res.data ?? []).map((r) => ({
      id: String(r.no),
      datetime: r.datetime,
      device: r.petName ?? r.device ?? r.model ?? '-',
      model: r.model,
      color: r.color,
      capacity: r.capacity,
      carrier: r.carrier,
      is_processed: r.is_processed ?? false,
      source: 'S26',
    }))

    const galaxy26 = (galaxy26Res.data ?? []).map((r) => ({
      id: String(r.id),
      datetime: r.created_at,
      device: r.model ?? '갤럭시 S26',
      model: r.model,
      color: r.color,
      capacity: null,
      carrier: r.mobile_carrier,
      is_processed: r.is_processed ?? false,
      source: '갤럭시 S26',
    }))

    const iphone17e = (iphone17eRes.data ?? []).map((r) => ({
      id: String(r.id),
      datetime: r.created_at,
      device: r.model ?? 'iPhone 17e',
      model: r.model,
      color: null,
      capacity: null,
      carrier: r.mobile_carrier,
      is_processed: r.status === '완료',
      source: 'iPhone 17e',
    }))

    const merged = [...s26, ...galaxy26, ...iphone17e].sort(
      (a, b) => new Date(b.datetime ?? 0).getTime() - new Date(a.datetime ?? 0).getTime()
    )

    return NextResponse.json(merged, { headers: cors })
  } catch (error) {
    console.error('GET /api/my/preorders 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
