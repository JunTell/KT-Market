import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { ROLE_PERMISSIONS } from '../types/auth'

import type { AdminUser} from '../types/auth';

interface AuthState {
    // 상태
    admin: AdminUser | null
    isInitialized: boolean

    // 액션
    setAdmin: (admin: AdminUser | null) => void
    initialize: (admin: AdminUser | null) => void
    reset: () => void

    // UI 헬퍼 (보안 검증 아님, UI 표시용)
    hasMenuAccess: (pathname: string) => boolean
}

export const useAuthStore = create<AuthState>()(
    devtools(
        (set, get) => ({
            // 초기 상태
            admin: null,
            isInitialized: false,

            // 액션
            setAdmin: (admin) => set({ admin }, false, 'setAdmin'),

            initialize: (admin) => set({
                admin,
                isInitialized: true
            }, false, 'initialize'),

            reset: () => set({
                admin: null,
                isInitialized: false
            }, false, 'reset'),

            // ⚠️ UI 메뉴 표시용으로만 사용
            // 실제 페이지 접근 권한은 서버에서 검증
            hasMenuAccess: (pathname: string) => {
                const { admin } = get()
                if (!admin) return false

                const permissions = ROLE_PERMISSIONS[admin.role]
                if (permissions[0] === '*') return true

                return permissions.some(path =>
                    pathname === path || pathname.startsWith(path + '/')
                )
            },
        }),
        { name: 'auth-store' }
    )
)
