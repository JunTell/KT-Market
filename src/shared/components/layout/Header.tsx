import Link from 'next/link'

import { getCurrentUserWithRole } from '@/src/shared/lib/auth/session'

import { UserMenu } from '../common/UserMenu'

export async function Header() {
  const { user, isAdmin } = await getCurrentUserWithRole()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line-200 bg-background/80 backdrop-blur-md">
      <div className="flex h-[60px] w-full items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-xl font-bold text-primary tracking-tight">KT Market</span>
        </Link>
        <UserMenu initialUser={user} initialIsAdmin={isAdmin} />
      </div>
    </header>
  )
}