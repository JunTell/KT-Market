import { NextResponse } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseAdminClient } from '@/src/shared/lib/supabase/admin'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { NextRequest } from 'next/server'

const TARGET_CHANNEL_ID = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_ID ?? '@ktmarket'

export async function POST(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))

  try {
    // 인증 확인
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401, headers: cors })
    }

    const admin = createSupabaseAdminClient()

    // 프로필에서 kakao_id 조회
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('kakao_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: '프로필을 찾을 수 없습니다.' }, { status: 404, headers: cors })
    }

    if (!profile.kakao_id) {
      return NextResponse.json({ error: '카카오 계정이 연결되지 않았습니다.' }, { status: 400, headers: cors })
    }

    const kakaoAdminKey = process.env.KAKAO_ADMIN_KEY
    if (!kakaoAdminKey) {
      return NextResponse.json({ error: '서버 설정 오류' }, { status: 500, headers: cors })
    }

    // 카카오 채널 추가 여부 조회
    const kakaoRes = await fetch(
      `https://kapi.kakao.com/v1/api/talk/channels?target_id_type=user_id&target_id=${profile.kakao_id}`,
      {
        headers: {
          Authorization: `KakaoAK ${kakaoAdminKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    const kakaoData = await kakaoRes.json()

    if (!kakaoRes.ok) {
      console.error('[sync-channel] Kakao API 오류:', kakaoData)
      return NextResponse.json(
        { error: '카카오 API 조회 실패', details: kakaoData },
        { status: kakaoRes.status, headers: cors }
      )
    }

    let relation = 'NONE'
    let channelAddedAt: string | null = null

    if (Array.isArray(kakaoData.channels)) {
      const target = kakaoData.channels.find(
        (c: { channel_uuid: string; relation: string; updated_at?: string }) =>
          c.channel_uuid === TARGET_CHANNEL_ID
      )
      if (target) {
        relation = target.relation // 'ADDED' | 'BLOCKED' | 'NONE'
        if (relation === 'ADDED' && target.updated_at) {
          channelAddedAt = new Date(target.updated_at).toISOString()
        }
      }
    }

    // kakao_channel_status upsert
    const now = new Date().toISOString()
    const { error: upsertError } = await admin
      .from('kakao_channel_status')
      .upsert(
        {
          profile_id: user.id,
          kakao_user_id: profile.kakao_id,
          relation,
          channel_added_at: channelAddedAt,
          channel_updated_at: now,
          last_checked_at: now,
          updated_at: now,
        },
        { onConflict: 'profile_id' }
      )

    if (upsertError) {
      console.error('[sync-channel] upsert 오류:', upsertError)
      return NextResponse.json({ error: 'DB 저장 실패', details: upsertError }, { status: 500, headers: cors })
    }

    return NextResponse.json(
      { success: true, relation, channel_added_at: channelAddedAt },
      { headers: cors }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    console.error('[sync-channel] 내부 오류:', err)
    return NextResponse.json({ error: '서버 오류', message }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
