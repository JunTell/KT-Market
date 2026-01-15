import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';

/**
 * 서버 컴포넌트/Server Actions에서 관리자 권한을 강제로 확인합니다.
 * 권한이 없으면 루트('/') 또는 로그인 페이지로 리다이렉트합니다.
 */
export async function requireAdmin() {
    const supabase = await createSupabaseServerClient();

    // 1. 세션 확인
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login?redirectTo=/admin');
    }

    // 2. Admin 권한 DB 확인
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.is_admin) {
        console.warn(`Unauthorized admin access attempt by user: ${user.id}`);
        redirect('/');
    }

    return user;
}
