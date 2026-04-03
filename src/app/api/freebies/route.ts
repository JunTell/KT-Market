import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseAdminClient } from '@/src/shared/lib/supabase/admin'

import type { NextRequest } from 'next/server'

/**
 * GET /api/freebies?planId=xxx
 * 사은품 목록 조회 (is_available=true, sort 오름차순)
 * planId가 있으면 plans 배열에 포함된 항목만 반환
 */
export async function GET(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))
  const planId = request.nextUrl.searchParams.get('planId') ?? ''

  try {
    const admin = createSupabaseAdminClient()

    const { data, error } = await admin
      .from('freebies')
      .select('no, sort, title, origin_price, discount_price, installment, monthly_price, plans')
      .eq('is_available', true)
      .order('sort', { ascending: true })

    if (error) throw error

    const freebies = data ?? []
    // 원본과 동일한 필터: plans 배열에 planId가 명시된 항목만 반환
    const filtered = planId
      ? freebies.filter(
          (f) => Array.isArray(f.plans) && f.plans.includes(planId)
        )
      : freebies

    return NextResponse.json(filtered, { headers: cors })
  } catch (error) {
    console.error('GET /api/freebies 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
