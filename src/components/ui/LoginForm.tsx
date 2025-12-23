'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseClient } from '@/src/lib/supabase/client'
import {
  getSavedEmail,
  setSavedEmail,
  clearSavedEmail,
  setRememberMe,
} from '@/src/lib/auth'
import Link from 'next/link'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMeChecked, setRememberMeChecked] = useState(false)
  const [saveIdChecked, setSaveIdChecked] = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const savedEmail = getSavedEmail()
    if (savedEmail) {
      setEmail(savedEmail)
      setSaveIdChecked(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (saveIdChecked) setSavedEmail(email)
      else clearSavedEmail()

      setRememberMe(rememberMeChecked)

      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setLoading(false)
        setError(signInError.message === 'Invalid login credentials'
          ? '아이디 또는 비밀번호가 일치하지 않습니다.'
          : signInError.message)
        return
      }

      // 서버에 세션 동기화 (서버 쿠키 설정 보장)
      try {
        await fetch('/api/auth/session', { method: 'POST' })
      } catch (syncError) {
        console.warn('세션 동기화 실패, 계속 진행:', syncError)
      }

      setLoading(false)
      setRedirecting(true)

      // 확실한 페이지 리로드를 위해 replace 사용
      window.location.replace(redirectTo)

    } catch (err) {
      setLoading(false)
      setError('로그인 처리 중 오류가 발생했습니다.')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-[400px]">
        {/* 로고 영역 */}
        <div className="mb-10 text-center">
          <Link href="/" className="text-3xl font-extrabold text-[#0066FF] tracking-tight cursor-pointer">
            KT Market
          </Link>
        </div>

        {/* 탭 메뉴 삭제 후 제목 추가 (선택 사항) */}
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">로그인</h2>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-2">
            <input
              type="email"
              placeholder="아이디(이메일)"
              className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-[#0066FF] transition-all text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="비밀번호"
              className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-[#0066FF] transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* 옵션 및 체크박스 */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded accent-[#0066FF] cursor-pointer"
                  checked={saveIdChecked}
                  onChange={(e) => setSaveIdChecked(e.target.checked)}
                />
                <span className="text-[13px] text-gray-600 group-hover:text-black transition-colors">아이디 저장</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded accent-[#0066FF] cursor-pointer"
                  checked={rememberMeChecked}
                  onChange={(e) => setRememberMeChecked(e.target.checked)}
                />
                <span className="text-[13px] text-gray-600 group-hover:text-black transition-colors">자동 로그인</span>
              </label>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading || redirecting}
            className="w-full h-12 bg-[#0066FF] text-white rounded-md font-bold text-base hover:bg-[#0052cc] transition-colors mt-2 cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {redirecting ? '이동 중...' : loading ? '로그인 중...' : '로그인'}
          </button>

          {/* 에러 메시지 */}
          {error && <p className="text-red-500 text-xs text-center mt-2 font-medium">{error}</p>}

          {/* 하단 링크 */}
          <div className="flex items-center justify-center gap-3 text-[13px] text-gray-400 mt-6">
            <Link href="/find-id" className="hover:text-gray-700 cursor-pointer">아이디 찾기</Link>
            <span className="w-px h-3 bg-gray-200"></span>
            <Link href="/find-pw" className="hover:text-gray-700 cursor-pointer">비밀번호 찾기</Link>
            <span className="w-px h-3 bg-gray-200"></span>
            <Link href="/signup" className="text-gray-700 font-bold hover:underline cursor-pointer">회원가입</Link>
          </div>
        </form>

        {/* 간편 로그인 영역 */}
        <div className="mt-12">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-full h-px bg-gray-100"></div>
            <span className="relative px-4 bg-white text-xs text-gray-400">간편 로그인</span>
          </div>

          <div className="flex justify-center gap-6">
            <button
              type="button"
              onClick={() => supabaseClient.auth.signInWithOAuth({ 
                provider: 'kakao', 
                options: { redirectTo: `${window.location.origin}/` } 
              })}
              className="group flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="w-12 h-12 bg-[#FEE500] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                <img src="/icons/kakao.svg" alt="Kakao" className="w-6 h-6" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => supabaseClient.auth.signInWithOAuth({ 
                provider: 'google', 
                options: { redirectTo: `${window.location.origin}/` } 
              })}
              className="group flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                <img src="/icons/google.svg" alt="Google" className="w-6 h-6" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
