'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Server Action에서 쿠키 기반 인증 사용 예시
 *
 * Server Action은:
 * - 'use server' 지시문으로 시작
 * - cookies().set()이 정상 작동 (Route Handler처럼)
 * - Form 제출이나 클라이언트에서 직접 호출 가능
 */

/**
 * 현재 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/**
 * 로그아웃 처리
 */
export async function signOut() {
  const supabase = await createSupabaseServerClient()

  await supabase.auth.signOut()

  // 캐시 무효화 및 리다이렉트
  revalidatePath('/', 'layout')
  redirect('/login')
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.')
  }

  // FormData에서 값 추출
  const displayName = formData.get('displayName') as string

  // 프로필 업데이트
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  // 관련 페이지 재검증
  revalidatePath('/admin')

  return { success: true }
}
