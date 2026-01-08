import Link from 'next/link'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { UserMenu } from '../common/UserMenu'

export async function Header() {
  const supabase = await createSupabaseServerClient()
  
  // 서버에서 세션 확인
  const { data: { user } } = await supabase.auth.getUser()

  // 서버에서 관리자 여부 확인
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = !!profile?.is_admin
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line-200 bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 cursor-pointer">
          <div className="text-2xl font-bold text-primary">KT Market</div>
        </Link>

        {/* 서버 데이터를 UserMenu에 주입하여 즉시 렌더링 */}
        <UserMenu initialUser={user} initialIsAdmin={isAdmin} />
      </div>
    </header>
  )
}