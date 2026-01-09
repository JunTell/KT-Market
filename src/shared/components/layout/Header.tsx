import Link from 'next/link'
import { getCurrentUserWithRole } from '@/src/shared/lib/auth/session'
import { UserMenu } from '../common/UserMenu'

export async function Header() {
  // DAL을 통해 유저 및 관리자 권한 확인
  const { user, isAdmin } = await getCurrentUserWithRole()

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