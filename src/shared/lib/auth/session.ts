import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

import type { User } from '@supabase/supabase-js'

export interface UserWithRole {
    user: User | null
    isAdmin: boolean
}

/**
 * 서버 사이드에서 현재 인증된 사용자와 관리자 권한 여부를 가져옵니다.
 *
 * @returns {Promise<UserWithRole>} user 객체와 isAdmin boolean 값
 */
export async function getCurrentUserWithRole(): Promise<UserWithRole> {
    const supabase = await createSupabaseServerClient()

    // 1. 세션(유저) 가져오기
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { user: null, isAdmin: false }
    }

    // 2. 프로필(관리자 여부) 가져오기
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        return {
            user,
            isAdmin: !!profile?.is_admin,
        }
    } catch (error) {
        console.error('Error fetching admin status:', error)
        // 프로필 조회 실패 시 안전하게 일반 유저로 처리
        return { user, isAdmin: false }
    }
}
