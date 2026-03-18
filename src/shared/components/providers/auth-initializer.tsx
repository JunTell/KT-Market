'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '../../stores/auth-store'
import { AdminUser } from '../../types/auth'

interface AuthInitializerProps {
    admin: AdminUser | null
    children: React.ReactNode
}

// Server Component에서 검증된 admin 데이터로 Store 초기화
export function AuthInitializer({ admin, children }: AuthInitializerProps) {
    const initialize = useAuthStore((state) => state.initialize)
    const isInitialized = useAuthStore((state) => state.isInitialized)
    const initializedRef = useRef(false)

    useEffect(() => {
        // 한 번만 초기화
        if (!initializedRef.current) {
            initialize(admin)
            initializedRef.current = true
        }
    }, [admin, initialize])

    // Hydration 불일치 방지
    if (!isInitialized) {
        return null // 또는 로딩 스피너
    }

    return <>{children}</>
}
