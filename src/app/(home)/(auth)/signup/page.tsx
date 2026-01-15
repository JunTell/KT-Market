import { Suspense } from 'react'

import SignupForm from '@/src/shared/ui/SignupForm'

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8">
      <Suspense fallback={<div className="text-gray-400">로딩 중...</div>}>
        <SignupForm />
      </Suspense>
    </main>
  )
}