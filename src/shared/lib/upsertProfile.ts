import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * +82 10-1234-5678 → 01012345678
 */
function formatPhone(phone: string | undefined | null): string | null {
  if (!phone) return null
  return phone.replace(/^\+82\s?/, '0').replace(/[-\s]/g, '')
}

/**
 * birthyear="1990", birthday="0115" → "19900115"
 */
function formatBirthday(
  birthyear: string | undefined | null,
  birthday: string | undefined | null
): string | null {
  if (!birthyear || !birthday) return null
  return birthyear + birthday
}

/**
 * 카카오 로그인 완료 후 profiles 테이블에 upsert
 * kakao_id 충돌 시 기존 레코드를 최신 정보로 갱신
 */
export async function upsertProfile(supabase: SupabaseClient, user: User) {
  const meta = user.user_metadata ?? {}
  const kakaoId =
    user.identities?.[0]?.identity_data?.provider_id ?? null

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      kakao_id: kakaoId,
      full_name: meta.name ?? meta.full_name ?? null,
      avatar_url: meta.avatar_url ?? null,
      email: user.email ?? null,
      phone: formatPhone(meta.phone_number),
      birthday: formatBirthday(meta.birthyear, meta.birthday),
      provider: 'kakao',
      last_login_at: new Date().toISOString(),
    },
    {
      onConflict: 'kakao_id',
      ignoreDuplicates: false,
    }
  )

  if (error) {
    console.error('프로필 upsert 실패:', error)
    throw error
  }
}
