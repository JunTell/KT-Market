import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

/**
 * GET /api/my/wishlist
 * 유저 찜 목록 (user_wishlists + devices join, created_at 최신순)
 *
 * DELETE /api/my/wishlist?id=:wishlistId
 * 찜 항목 제거
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

    const { data, error } = await supabase
      .from('user_wishlists')
      .select(
        `
        id,
        created_at,
        device_model,
        devices!inner (
          pet_name,
          thumbnail,
          price,
          category_kr,
          company
        )
      `
      )
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(
      (data ?? []).map((r) => ({
        id: r.id,
        created_at: r.created_at,
        device_model: r.device_model,
        pet_name: (r.devices as any)?.pet_name ?? r.device_model,
        thumbnail: (r.devices as any)?.thumbnail ?? null,
        price: (r.devices as any)?.price ?? null,
        category_kr: (r.devices as any)?.category_kr ?? null,
        company: (r.devices as any)?.company ?? null,
      })),
      { headers: cors }
    )
  } catch (error) {
    console.error('GET /api/my/wishlist 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500, headers: cors })
  }
}

export async function DELETE(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id 필요' }, { status: 400, headers: cors })
    }

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401, headers: cors })
    }

    const { error } = await supabase
      .from('user_wishlists')
      .delete()
      .eq('id', id)
      .eq('profile_id', user.id) // 본인 것만 삭제

    if (error) throw error

    return NextResponse.json({ success: true }, { headers: cors })
  } catch (error) {
    console.error('DELETE /api/my/wishlist 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
