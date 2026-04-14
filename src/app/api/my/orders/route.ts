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

/**
 * POST /api/my/orders
 * 주문 저장. 모델명에 따라 iphone17_order / s26_orders / preorder_17e_orders / online_order 분기.
 * Body: { data: sessionStorage["data"], sheet: sessionStorage["sheet"], form: { userName, userPhone, userDob } }
 */

const PREORDER_MODELS = [
  'aip17-256', 'aip17-512',
  'aipa-256', 'aipa-512', 'aipa-1t',
  'aip17p-256', 'aip17p-512', 'aip17p-1t',
  'aip17pm-256', 'aip17pm-512', 'aip17pm-1t', 'aip17pm-2t',
]
const S26_ORDER_MODELS = [
  'sm-s942nk', 'sm-s942nk512', 'sm-s947nk', 'sm-s947nk512', 'sm-s948nk', 'sm-s948nk512',
]
const AIP17E_ORDER_MODELS = ['aip17e-256', 'aip17e-512']

function normalizePhone(input?: string): string {
  if (!input) return ''
  const digits = input.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return digits
}

export async function POST(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))

  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { data: parsedData, sheet: parsedSheet, form: formData, isConsultation } = body

    const profileId = user?.id ?? null
    const model: string = parsedData?.device?.model ?? ''
    const admin = createSupabaseAdminClient()

    // carrier fallback: withRegister가 초기 기기변경 상태일 때 store.carrier가 undefined일 수 있음
    const carrier: string | null =
      parsedData?.carrier ??
      (parsedData?.register === '기기변경'
        ? 'KT'
        : parsedData?.register === '번호이동'
          ? (parsedData?.currentCarrier ?? 'SKT')
          : parsedData?.register === '신규가입'
            ? '신규가입'
            : 'KT')

    // 1. 아이폰 17 사전예약 분기
    if (model && PREORDER_MODELS.includes(model)) {
      const { error } = await admin.from('iphone17_order').insert([{
        profile_id: profileId,
        model,
        capacity: parsedData?.device?.capacity ?? '',
        color: parsedData?.color?.kr,
        pet_name: parsedData?.device?.pet_name,
        name: formData.userName,
        phone: normalizePhone(formData.userPhone),
        birthday: formData.userDob,
        register: parsedData?.register,
        plan: parsedData?.selectedPlan?.name || parsedSheet?.planName,
        discount: parsedSheet?.discount,
        carrier,
        benefit: parsedSheet?.ktmarketSubsidy,
        installment: parsedSheet?.installment,
        form_link: parsedData?.form_link || parsedSheet?.formLink,
        freebie: parsedSheet?.freebie,
        freebie_second: parsedData?.freebieSecond,
        is_guaranteed_return: parsedSheet?.isGuaranteedReturn ?? false,
        installment_principal: parsedSheet?.installmentPrincipal,
        is_consultation: isConsultation ?? false,
      }])
      if (error) throw error
    }
    // 2. 갤럭시 S26 분기
    else if (model && S26_ORDER_MODELS.includes(model)) {
      const { error } = await admin.from('s26_orders').insert([{
        profile_id: profileId,
        "petName": parsedData?.device?.pet_name,
        device: model,
        model,
        capacity: parsedData?.device?.capacity ?? '',
        color: parsedData?.color?.kr,
        name: formData.userName,
        phone: normalizePhone(formData.userPhone),
        birthday: formData.userDob,
        register: parsedData?.register,
        plan: parsedSheet?.planName,
        discount: parsedSheet?.discount,
        carrier,
        benefit: parsedData?.ktmarketSubsidy || parsedSheet?.ktmarketSubsidy,
        installment: parsedData?.installment || parsedSheet?.installment,
        freebie: parsedSheet?.freebie,
        installment_principal: parsedSheet?.installmentPrincipal,
        is_consultation: isConsultation ?? false,
      }])
      if (error) {
        if ((error as any).code === '23505') return NextResponse.json({ duplicate: true }, { status: 200, headers: cors })
        throw error
      }
    }
    // 3. 아이폰 17e 분기
    else if (model && AIP17E_ORDER_MODELS.includes(model)) {
      const { error } = await admin.from('preorder_17e_orders').insert([{
        profile_id: profileId,
        "petName": parsedData?.device?.pet_name,
        device: parsedData?.device?.category || 'iPhone 17e',
        model,
        capacity: parsedData?.device?.capacity ?? '',
        color: parsedData?.color?.kr,
        name: formData.userName,
        phone: normalizePhone(formData.userPhone),
        birthday: formData.userDob,
        register: parsedData?.register,
        plan: parsedSheet?.planName,
        discount: parsedSheet?.discount,
        carrier,
        benefit: parsedData?.ktmarketSubsidy || parsedSheet?.ktmarketSubsidy,
        installment: parsedData?.installment || parsedSheet?.installment,
        installment_principal: parsedSheet?.installmentPrincipal,
        freebie: parsedSheet?.freebie,
        is_consultation: isConsultation ?? false,
      }])
      if (error) {
        if ((error as any).code === '23505') return NextResponse.json({ duplicate: true }, { status: 200, headers: cors })
        throw error
      }
    }
    // 4. 기본 온라인 오더
    else {
      const { error } = await admin.from('online_order').insert([{
        profile_id: profileId,
        "petName": parsedData?.device?.pet_name,
        device: model,
        model,
        capacity: parsedData?.device?.capacity ?? '',
        color: parsedData?.color?.kr,
        name: formData.userName,
        phone: normalizePhone(formData.userPhone),
        birthday: formData.userDob,
        register: parsedData?.register,
        carrier,
        plan: parsedSheet?.planName,
        discount: parsedSheet?.discount,
        benefit: parsedData?.ktmarketSubsidy || parsedSheet?.ktmarketSubsidy,
        installment: parsedData?.installment || parsedSheet?.installment,
        freebie: parsedSheet?.freebie,
        installment_principal: parsedSheet?.installmentPrincipal,
        is_consultation: isConsultation ?? false,
      }])
      if (error) throw error
    }

    return NextResponse.json({ ok: true }, { headers: cors })
  } catch (error) {
    console.error('POST /api/my/orders 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
