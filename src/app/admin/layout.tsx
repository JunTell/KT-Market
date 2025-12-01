// src/app/admin/layout.tsx
import { ReactNode } from 'react'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="ko">
      <body className="bg-[#050505] text-white">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <span className="font-semibold">KT Market Admin</span>
            </Link>
            <nav className="flex gap-3 text-sm text-white/70">
              <Link href="/admin/events">Events</Link>
              {/* 다른 메뉴들 추가 예정 */}
            </nav>
          </div>
          <div className="text-xs text-white/60">
            {user ? user.email : '로그인 정보 없음'}
          </div>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  )
}