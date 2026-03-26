import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

/**
 * DELETE /api/auth/withdraw
 * 회원 탈퇴 — 세션 쿠키로 인증된 사용자만 호출 가능
 *
 * 처리 순서:
 * 1. 세션에서 user 추출 (없으면 401)
 * 2. profiles soft delete: PII 익명화
 * 3. 카카오 연동 해제 (KAKAO_ADMIN_KEY 설정 시)
 * 4. Supabase auth.users 완전 삭제 (service_role key 사용)
 * 5. { success: true } 반환 → Framer에서 메인 페이지로 리다이렉트
 */
export async function DELETE(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))
  const supabase = await createSupabaseServerClient()

  // 1. 세션 검증
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: '인증이 필요합니다.' },
      { status: 401, headers: cors }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceKey) {
    return NextResponse.json(
      { error: '서버 설정 오류' },
      { status: 500, headers: cors }
    )
  }

  // 2. kakao_id 조회 (카카오 연동 해제에 사용)
  const { data: profile } = await supabase
    .from('profiles')
    .select('kakao_id')
    .eq('id', user.id)
    .single()

  // 3. Supabase 유저 완전 삭제를 먼저 시도 (service_role key 필수)
  // → 삭제 성공 후 PII 익명화 순서로 변경하여 inconsistent state 방지
  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('Supabase 유저 삭제 실패:', deleteError)
    return NextResponse.json(
      { error: '회원탈퇴 처리 중 오류가 발생했습니다.' },
      { status: 500, headers: cors }
    )
  }

  // 4. profiles soft delete: 개인정보(PII) 익명화
  // auth.users 삭제 성공 후 진행 — 실패해도 계정은 이미 삭제됨
  const { error: updateError } = await supabaseAdmin.from('profiles').update({
    is_active: false,
    deleted_at: new Date().toISOString(),
    full_name: '탈퇴한 회원',
    phone: null,
    birthday: null,
    avatar_url: null,
    email: null,
  }).eq('id', user.id)

  if (updateError) {
    // 계정 삭제는 성공했으므로 에러 반환하지 않고 로그만 기록
    console.error('프로필 soft delete 실패 (계정 삭제는 완료됨):', updateError)
  }

  // 5. 카카오 연동 해제 (선택 — KAKAO_ADMIN_KEY 설정 시)
  const kakaoAdminKey = process.env.KAKAO_ADMIN_KEY
  if (kakaoAdminKey && profile?.kakao_id) {
    try {
      const res = await fetch('https://kapi.kakao.com/v1/user/unlink', {
        method: 'POST',
        headers: {
          Authorization: `KakaoAK ${kakaoAdminKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `target_id_type=user_id&target_id=${profile.kakao_id}`,
      })
      if (!res.ok) {
        console.error('카카오 연동 해제 실패 (계속 진행):', await res.text())
      }
    } catch (err) {
      console.error('카카오 연동 해제 요청 오류 (계속 진행):', err)
    }
  }

  return NextResponse.json({ success: true }, { headers: cors })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
