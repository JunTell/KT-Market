'use client'

import { useState } from 'react'
import { supabaseClient } from '@/src/lib/supabase/client'
import Link from 'next/link'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      setLoading(true)
      const { data, error: signupError } = await supabaseClient.auth.signUp({
        email,
        password,
      })

      if (signupError) {
        setError(signupError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        await supabaseClient.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          is_admin: false,
        }, { onConflict: 'id' })
      }

      setMessage('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.')
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (err: any) {
      setError(err?.message ?? '회원가입 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  // 소셜 로그인 핸들러
  const handleSocialSignup = async (provider: 'kakao' | 'google') => {
    await supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-10 text-center">
        <Link href="/" className="text-3xl font-extrabold text-[#0066FF] tracking-tight cursor-pointer">
          KT Market
        </Link>
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">회원가입</h2>
        <p className="text-sm text-gray-500 mt-2">KT Market의 다양한 혜택을 만나보세요.</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-3">
        <div className="space-y-2">
          <input
            type="email"
            placeholder="이메일 주소"
            className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-[#0066FF] transition-all text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-[#0066FF] transition-all text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-[#0066FF] transition-all text-sm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-xs text-center font-medium py-1">{error}</p>}
        {message && <p className="text-[#0066FF] text-xs text-center font-medium py-1">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#0066FF] text-white rounded-md font-bold text-base hover:bg-[#0052cc] transition-colors mt-2 cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : '회원가입'}
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
    </div>
  )
}