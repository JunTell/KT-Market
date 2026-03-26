import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

/**
 * GET /api/my/viewed?limit=5
 * 최근 본 기기 목록 (최신순, 중복 제거)
 *
 * [{ device_model, pet_name, thumbnail, viewed_at }]
 */
export async function GET(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))
  const limit = Math.min(
    parseInt(request.nextUrl.searchParams.get('limit') ?? '5', 10),
    20
  )

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

    // 최근 본 기기 — devices 정보 join, 중복 모델은 최신 것만
    const { data, error } = await supabase
      .from('user_viewed_devices')
      .select(
        `
        id,
        viewed_at,
        device_model,
        devices!inner (
          pet_name,
          thumbnail,
          price
        )
      `
      )
      .eq('profile_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(limit * 3) // 중복 제거 여유분

    if (error) throw error

    // 모델 중복 제거 (최신 viewed_at 우선)
    const seen = new Set<string>()
    const unique = (data ?? []).filter((row) => {
      if (seen.has(row.device_model)) return false
      seen.add(row.device_model)
      return true
    })

    return NextResponse.json(
      unique.slice(0, limit).map((row) => ({
        device_model: row.device_model,
        pet_name: (row.devices as any)?.pet_name ?? row.device_model,
        thumbnail: (row.devices as any)?.thumbnail ?? null,
        price: (row.devices as any)?.price ?? null,
        viewed_at: row.viewed_at,
      })),
      { headers: cors }
    )
  } catch (error) {
    console.error('GET /api/my/viewed 오류:', error)
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
