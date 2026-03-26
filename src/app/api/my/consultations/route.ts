import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseAdminClient } from '@/src/shared/lib/supabase/admin'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

/**
 * GET /api/my/consultations
 * 유저 상담 접수 내역 (customer_consultations, created_at 최신순)
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
      .from('customer_consultations')
      .select('id, created_at, name, description, mobile_carrier, is_processed')
      .eq('phone', phone)
      .order('created_at', { ascending: false })

    return NextResponse.json(data ?? [], { headers: cors })
  } catch (error) {
    console.error('GET /api/my/consultations 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
