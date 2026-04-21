import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCorsHeaders } from '@/src/shared/lib/cors'
import type { NextRequest } from 'next/server'

type RegisterType = 'mnp' | 'chg'

const TIERS = [
  { key: 'gte_37000', planPrice: 45000, label: '3.7만원↑' },
  { key: 'gte_61000', planPrice: 75000, label: '6.9만원↑' },
  { key: 'gte_90000', planPrice: 100000, label: '9.0만원↑' },
] as const

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const cors = getCorsHeaders(request.headers.get('origin'))
  const { searchParams } = new URL(request.url)
  const modelsParam = searchParams.get('models') ?? ''
  const registerParam = searchParams.get('register') ?? 'mnp'
  if (!['mnp', 'chg'].includes(registerParam)) {
    return NextResponse.json({ error: 'register는 mnp 또는 chg만 허용됩니다' }, { status: 400, headers: cors })
  }
  const register = registerParam as RegisterType

  const models = modelsParam.split(',').map((m) => m.trim()).filter(Boolean).slice(0, 3)

  if (models.length === 0) {
    return NextResponse.json({ error: 'models 파라미터 필요' }, { status: 400, headers: cors })
  }

  const [devicesRes, subsidyRes] = await Promise.all([
    supabase
      .from('devices')
      .select('model, pet_name, price, subsidy, thumbnail, category, colors_en, images')
      .in('model', models),
    supabase
      .from('ktmarket_subsidy')
      .select('*')
      .in('model', models),
  ])

  if (devicesRes.error) {
    return NextResponse.json({ error: devicesRes.error.message }, { status: 500, headers: cors })
  }

  const subsidyMap = Object.fromEntries(
    (subsidyRes.data ?? []).map((row) => [row.model, row])
  )

  const result = (devicesRes.data ?? []).map((device) => {
    const sub = subsidyMap[device.model] ?? {}
    const baseDevicePrice = (device.price ?? 0) - (device.subsidy ?? 0)

    const plans = TIERS.map(({ key, planPrice, label }) => {
      const deviceDiscount: number = sub[`device_discount_${register}_${key}`] ?? 0
      const planDiscount: number = sub[`plan_discount_${register}_${key}`] ?? 0

      const finalDevicePrice = Math.max(0, baseDevicePrice - deviceDiscount)
      const monthlyDevice = Math.ceil(finalDevicePrice / 24)
      const monthlyPlan = Math.max(0, planPrice - planDiscount)
      const monthly = monthlyDevice + monthlyPlan

      return { tier: key, label, monthly, deviceDiscount, planDiscount }
    })

    return {
      model: device.model,
      pet_name: device.pet_name,
      thumbnail: device.thumbnail,
      category: device.category ?? null,
      colors_en: device.colors_en ?? [],
      images: device.images ?? {},
      price: device.price ?? 0,
      disclosure_subsidy: device.subsidy ?? 0,
      plans,
    }
  })

  return NextResponse.json(result, { headers: cors })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
