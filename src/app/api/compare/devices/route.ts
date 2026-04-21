import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCorsHeaders } from '@/src/shared/lib/cors'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const cors = getCorsHeaders(request.headers.get('origin'))

  const { data, error } = await supabase
    .from('devices')
    .select('model, pet_name, thumbnail, company, category, capacity, capacities, colors_en, images, price, subsidy')
    .eq('is_available', true)
    .order('priority', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: cors })
  }

  return NextResponse.json(data, { headers: cors })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
