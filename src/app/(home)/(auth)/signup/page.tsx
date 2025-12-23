import SignupForm from '@/src/components/ui/SignupForm'
import { Suspense } from 'react'

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8">
      <Suspense fallback={<div className="text-gray-400">로딩 중...</div>}>
        <SignupForm />
      </Suspense>
    </main>
  )
}