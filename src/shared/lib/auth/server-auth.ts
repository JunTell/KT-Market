import { createSupabaseServerClient as createClient } from '../supabase/server'
import { redirect } from 'next/navigation'
import { Role, AdminUser } from '../../types/auth'
import { cache } from 'react'

// 현재 인증된 관리자 조회 (DB 직접 조회) - Request Memoization 적용
export const getAuthenticatedAdmin = cache(async (): Promise<AdminUser | null> => {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || !user.email) {
        return null
    }

    const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        // admin table active column exists check could be done later, assuming Juntell scheme
        .single()

    if (adminError || !admin) {
        return null
    }

    return admin as AdminUser
})

// 특정 역할 필수 (페이지 보호용)
export async function requireRole(allowedRoles: Role[]): Promise<AdminUser> {
    const admin = await getAuthenticatedAdmin()

    if (!admin) {
        redirect('/login')
    }

    if (!allowedRoles.includes(admin.role)) {
        redirect('/unauthorized')
    }

    return admin
}
