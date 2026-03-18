'use client'

import { LogOut, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { createSupabaseBrowserClient as createClient } from '../../../shared/lib/supabase/client'
import { useAuthStore } from '../../../shared/stores/auth-store'
import { useAdminUIStore } from '../stores/ui-store'

export function Header() {
    const router = useRouter()
    const supabase = createClient()
    const reset = useAuthStore((state) => state.reset)
    const admin = useAuthStore((state) => state.admin)
    const openSidebar = useAdminUIStore((state) => state.openSidebar)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        reset() // Zustand store 초기화
        router.push('/login')
        router.refresh()
    }

    return (
        <header className="bg-background-default border-b border-line-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button
                    onClick={openSidebar}
                    className="md:hidden text-label-900 hover:bg-background-alternative p-2 rounded-md -ml-2"
                    aria-label="메뉴 열기"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold">KT Market 관리자페이지</h1>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-label-700 hidden sm:inline-block">
                    {admin?.name}
                </span>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-label-700 hover:text-label-900 transition"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">로그아웃</span>
                </button>
            </div>
        </header>
    )
}
