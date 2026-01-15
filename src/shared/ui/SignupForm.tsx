'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'

import { signup } from '@/src/shared/actions/auth'
import { supabaseClient } from '@/src/shared/lib/supabase/client'

const initialState = {
  error: null,
  message: null
}

export default function SignupForm() {
  const router = useRouter()
  // React 19 useActionState hook for form handling
  const [state, formAction, isPending] = useActionState(signup, initialState)

  useEffect(() => {
    if (state.success && state.email) {
      router.push(`/signup/verify?email=${encodeURIComponent(state.email)}`)
    }
  }, [state.success, state.email, router])

  // 소셜 로그인 핸들러 (클라이언트 사이드 유지)
  const handleSocialSignup = async (provider: 'kakao' | 'google') => {
    await supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
  }

  return (
    <section className="w-full max-w-[400px]">
      <div className="mb-10 text-center">
        <Link href="/" className="text-3xl font-extrabold text-[#0066FF] tracking-tight cursor-pointer">
          KT Market
        </Link>
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">회원가입</h2>
        <p className="text-sm text-gray-500 mt-2">KT Market의 다양한 혜택을 만나보세요.</p>
      </div>

      <form action={formAction} className="space-y-3">
        <div className="space-y-2">
          <input
            name="email"
            type="email"
            placeholder="이메일 주소"
            className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-[#0066FF] transition-all text-sm"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호 (6자 이상)"
            className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-[#0066FF] transition-all text-sm"
            required
          />
          <input
            name="passwordConfirm"
            type="password"
            placeholder="비밀번호 확인"
            className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-[#0066FF] transition-all text-sm"
            required
          />
        </div>

        {state.error && <p className="text-red-500 text-xs text-center font-medium py-1">{state.error}</p>}
        {state.message && <p className="text-[#0066FF] text-xs text-center font-medium py-1">{state.message}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-[#0066FF] text-white rounded-md font-bold text-base hover:bg-[#0052cc] transition-colors mt-2 cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isPending ? '처리 중...' : '회원가입'}
        </button>

        <div className="flex items-center justify-center gap-2 text-[13px] text-gray-500 mt-6">
          <span>이미 계정이 있으신가요?</span>
          <Link href="/login" className="text-gray-900 font-bold hover:underline cursor-pointer">
            로그인
          </Link>
        </div>
      </form>

      {/* 간편 회원가입 영역 */}
      <div className="mt-12">
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-full h-px bg-gray-100"></div>
          <span className="relative px-4 bg-white text-xs text-gray-400">간편 회원가입</span>
        </div>

        <div className="flex justify-center gap-6">
          <button
            type="button"
            onClick={() => handleSocialSignup('kakao')}
            className="group flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#FEE500] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
              <img src="/icons/kakao.svg" alt="Kakao" className="w-6 h-6" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignup('google')}
            className="group flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
              <img src="/icons/google.svg" alt="Google" className="w-6 h-6" />
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}