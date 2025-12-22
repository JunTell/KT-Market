'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseClient } from '@/src/lib/supabase/client'
import {
  getSavedEmail,
  setSavedEmail,
  clearSavedEmail,
  setRememberMe,
} from '@/src/lib/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMeChecked, setRememberMeChecked] = useState(false)
  const [saveIdChecked, setSaveIdChecked] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  // 컴포넌트 마운트 시 저장된 이메일 불러오기
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
      // 아이디 저장 처리
      if (saveIdChecked) {
        setSavedEmail(email)
      } else {
        clearSavedEmail()
      }

      // 로그인 유지 설정 저장
      setRememberMe(rememberMeChecked)

      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setLoading(false)
        setError(signInError.message)
        return
      }

      // 로그인 성공 → 세션이 완전히 설정될 때까지 대기
      console.log('[Login] 로그인 성공, 세션 확인 중...')

      // onAuthStateChange 이벤트가 처리될 시간 제공 (500ms)
      await new Promise(resolve => setTimeout(resolve, 500))

      // 최종 사용자 정보 및 프로필 확인
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      setLoading(false)
      setRedirecting(true)

      if (user) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        console.log('[Login] 프로필 확인:', profile)

        // 짧은 지연 후 리다이렉트 (사용자에게 피드백 제공)
        await new Promise(resolve => setTimeout(resolve, 300))

        // 관리자라면 /admin 이동
        if (profile?.is_admin === true) {
          console.log('[Login] 관리자 계정, /admin으로 이동')
          window.location.href = '/admin'
          return
        }
      }

      // 일반 회원은 기본 페이지로 이동
      console.log('[Login] 일반 사용자, 홈으로 이동')
      window.location.href = '/'
    } catch (err) {
      console.error('[Login] 로그인 처리 중 오류:', err)
      setLoading(false)
      setRedirecting(false)
      setError('로그인 처리 중 오류가 발생했습니다.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white text-black">
      <div className="w-full max-w-md">

        {/* 탭 영역 - 기업회원만 활성 */}
        <div className="flex border-b border-gray-300 mb-6">
          <h2 className="text-2xl font-semibold text-center">로그인</h2>
        </div>

        {/* 입력폼 */}
        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="아이디"
            className="w-full border rounded px-3 py-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="비밀번호"
            className="w-full border rounded px-3 py-3 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 체크박스 */}
          <div className="flex items-center gap-6 text-sm mt-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={rememberMeChecked}
                onChange={(e) => setRememberMeChecked(e.target.checked)}
              />
              로그인 유지
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={saveIdChecked}
                onChange={(e) => setSaveIdChecked(e.target.checked)}
              />
              아이디 저장
            </label>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading || redirecting}
            className={`w-full text-white rounded py-3 font-semibold mt-2 transition-colors ${
              loading || redirecting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {redirecting
              ? '페이지 이동 중...'
              : loading
              ? '로그인 중...'
              : '로그인'}
          </button>

          {/* 리다이렉트 메시지 */}
          {redirecting && (
            <p className="text-blue-600 text-sm text-center">
              로그인 성공! 잠시만 기다려주세요...
            </p>
          )}

          {/* 에러 */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* 아이디/비번 찾기 */}
          <div className="flex gap-3 text-sm text-gray-500 mt-2">
            <span>아이디 찾기</span>
            <span>|</span>
            <span>비밀번호 찾기</span>
          </div>
        </form>

        {/* 소셜 로그인 */}
        <div className="mt-10">
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">소셜 계정으로 간편 로그인</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <div className="flex justify-center gap-5">
            {/* Kakao */}
            <button
              type="button"
              onClick={() =>
                supabaseClient.auth.signInWithOAuth({
                  provider: 'kakao',
                  options: {
                    redirectTo,
                    scopes: 'account_email',
                  },
                })
              }
            >
              <img src="/icons/kakao.svg" className="w-12 h-12" />
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() =>
                supabaseClient.auth.signInWithOAuth({
                  provider: 'google',
                })
              }
            >
              <img src="/icons/google.svg" className="w-12 h-12" />
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <LoginForm />
    </Suspense>
  )
}