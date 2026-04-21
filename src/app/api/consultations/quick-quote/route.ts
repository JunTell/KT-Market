// src/app/api/consultations/quick-quote/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseAdminClient } from '@/src/shared/lib/supabase/admin'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

const QuickQuoteSchema = z.object({
  model: z.string().min(1, 'model 필수').max(100),
  petName: z.string().min(1, 'petName 필수').max(100),
  device: z.string().min(1, 'device 필수').max(50),
  capacity: z.string().max(50).default(''),
  register: z.enum(['번호이동', '기기변경']),
  name: z.string().min(2, '이름은 2자 이상').max(20, '이름은 20자 이하'),
  phone: z.string().regex(/^01[016789]\d{7,8}$/, '전화번호 형식 오류'),
  birthday: z.string().regex(/^\d{6}$/, '생년월일은 YYMMDD 6자리'),
})

export async function POST(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: '잘못된 요청 형식' }, { status: 400, headers: cors })
  }

  const parsed = QuickQuoteSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? '유효성 오류' },
      { status: 400, headers: cors }
    )
  }
  const input = parsed.data

  // 세션이 있으면 profile_id 자동 연결 (없어도 진행)
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // model 존재 여부 검증 (admin client — RLS 우회)
  const admin = createSupabaseAdminClient()
  const { data: device } = await admin
    .from('devices')
    .select('model')
    .eq('model', input.model)
    .maybeSingle()

  if (!device) {
    return NextResponse.json({ ok: false, error: '존재하지 않는 기종' }, { status: 400, headers: cors })
  }

  const { data, error } = await admin
    .from('customer_consultations')
    .insert({
      name: input.name,
      phone: input.phone,
      birthday: input.birthday,
      device: input.device,
      model: input.model,
      petName: input.petName,
      capacity: input.capacity,
      register: input.register,
      carrier: 'KT',
      is_consultation: true,
      is_processed: false,
      profile_id: user?.id ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[quick-quote] insert failed', { error, model: input.model })
    return NextResponse.json({ ok: false, error: '저장 중 오류가 발생했습니다' }, { status: 500, headers: cors })
  }

  return NextResponse.json({ ok: true, id: data.id }, { headers: cors })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
