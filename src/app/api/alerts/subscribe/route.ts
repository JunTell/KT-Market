// src/app/api/alerts/subscribe/route.ts
import { NextResponse } from 'next/server'
import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'
import { createSupabaseAdminClient } from '@/src/shared/lib/supabase/admin'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인 필요' }, { status: 401, headers: cors })
  }

  let body: { model?: string; register_type?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400, headers: cors })
  }
  const { model, register_type } = body

  if (!model || !register_type || !['mnp', 'chg'].includes(register_type)) {
    return NextResponse.json({ error: '유효하지 않은 요청' }, { status: 400, headers: cors })
  }

  const admin = createSupabaseAdminClient()
  const { data: device } = await admin
    .from('devices')
    .select('subsidy')
    .eq('model', model)
    .single()

  const { error } = await admin
    .from('price_alert_subscriptions')
    .upsert(
      {
        profile_id: user.id,
        model,
        register_type,
        last_subsidy: device?.subsidy ?? null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,model,register_type' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: cors })
  }

  return NextResponse.json({ ok: true }, { headers: cors })
}

export async function DELETE(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인 필요' }, { status: 401, headers: cors })
  }

  const { searchParams } = new URL(request.url)
  const model = searchParams.get('model')
  const register_type = searchParams.get('register_type')

  if (!model || !register_type) {
    return NextResponse.json({ error: 'model, register_type 필요' }, { status: 400, headers: cors })
  }
  if (!['mnp', 'chg'].includes(register_type)) {
    return NextResponse.json({ error: 'register_type은 mnp 또는 chg만 허용됩니다' }, { status: 400, headers: cors })
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('price_alert_subscriptions')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('profile_id', user.id)
    .eq('model', model)
    .eq('register_type', register_type)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: cors })
  }

  return NextResponse.json({ ok: true }, { headers: cors })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
