import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

/**
 * GET /api/my/summary
 * 마이페이지 각 섹션의 카운트 반환
 *
 * {
 *   wishlistCount:  number  // user_wishlists (profile_id 기준)
 *   viewedCount:   number  // user_viewed_devices (profile_id 기준)
 *   orderCount:    number  // online_order + iphone17_order + call_order + s26_orders (phone 기준)
 *   consultCount:  number  // customer_consultations (phone 기준)
 *   preorderCount: number  // preorder_s26_orders + preorder-galaxy26 + preorder_iphone17e (phone 기준)
 *   restockCount:  number  // restock_notification (phone 기준)
 *   referralCount: number  // referral_consultation (referrer_phone 기준)
 * }
 */
export async function GET(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))

  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: '인증 필요' },
        { status: 401, headers: cors }
      )
    }

    // 프로필에서 phone 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .single()

    const phone = profile?.phone ?? null

    // ── profile_id 기준 조회 ──────────────────────────
    const [wishlistRes, viewedRes] = await Promise.all([
      supabase
        .from('user_wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id),
      supabase
        .from('user_viewed_devices')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id),
    ])

    // ── phone 기준 조회 (phone 없으면 전부 0) ─────────
    const [
      onlineOrderRes,
      iphone17OrderRes,
      callOrderRes,
      s26OrderRes,
      consultRes,
      preorderS26Res,
      preorderGalaxy26Res,
      preorderIphone17eRes,
      restockRes,
      referralRes,
    ] = phone
      ? await Promise.all([
          supabase
            .from('online_order')
            .select('*', { count: 'exact', head: true })
            .eq('phone', phone),
          supabase
            .from('iphone17_order')
            .select('*', { count: 'exact', head: true })
            .eq('phone', phone),
          supabase
            .from('call_order')
            .select('*', { count: 'exact', head: true })
            .eq('phone', phone),
          supabase
            .from('s26_orders')
            .select('*', { count: 'exact', head: true })
            .eq('phone', phone),
          supabase
            .from('customer_consultations')
            .select('*', { count: 'exact', head: true })
            .eq('phone', phone),
          supabase
            .from('preorder_s26_orders')
            .select('*', { count: 'exact', head: true })
            .eq('phone', phone),
          supabase
            .from('preorder-galaxy26')
            .select('*', { count: 'exact', head: true })
            .eq('phone', phone),
          supabase
            .from('preorder_iphone17e')
            .select('*', { count: 'exact', head: true })
            .eq('phone', phone),
          supabase
            .from('restock_notification')
            .select('*', { count: 'exact', head: true })
            .eq('phone', phone),
          supabase
            .from('referral_consultation')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_phone', phone),
        ])
      : Array(10).fill({ count: 0 })

    return NextResponse.json(
      {
        wishlistCount: wishlistRes.count ?? 0,
        viewedCount: viewedRes.count ?? 0,
        orderCount:
          (onlineOrderRes.count ?? 0) +
          (iphone17OrderRes.count ?? 0) +
          (callOrderRes.count ?? 0) +
          (s26OrderRes.count ?? 0),
        consultCount: consultRes.count ?? 0,
        preorderCount:
          (preorderS26Res.count ?? 0) +
          (preorderGalaxy26Res.count ?? 0) +
          (preorderIphone17eRes.count ?? 0),
        restockCount: restockRes.count ?? 0,
        referralCount: referralRes.count ?? 0,
      },
      { headers: cors }
    )
  } catch (error) {
    console.error('GET /api/my/summary 오류:', error)
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
