import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * 크로스 도메인(Framer ↔ Next.js API) 쿠키 전송을 위한 공통 옵션
 * - 개발: sameSite=lax, secure=false (localhost http 지원)
 * - 프로덕션: sameSite=none, secure=true (크로스 도메인 필수)
 */
const isProduction = process.env.NODE_ENV === 'production'

function crossDomainCookieOptions(): Partial<CookieOptions> {
  return {
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  }
}

/**
 * Server Component 및 Route Handler용 Supabase 클라이언트
 *
 * 쿠키 기반 세션 관리:
 * - HTTP-Only + Secure 쿠키에 세션 저장
 * - 클라이언트 JS에서 접근 불가
 * - 서버에서만 세션 읽기/쓰기 가능
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options, ...crossDomainCookieOptions() })
          } catch {
            // Server Component에서는 cookies().set()이 작동하지 않을 수 있음
            // Route Handler나 Server Action에서만 사용 가능
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, ...crossDomainCookieOptions() })
          } catch {
            // Server Component에서는 cookies().set()이 작동하지 않을 수 있음
          }
        },
      },
    }
  )
}

/**
 * Middleware 전용 Supabase 클라이언트
 *
 * Middleware에서는 NextRequest/NextResponse의 쿠키 API를 사용:
 * - req.cookies.get() - 쿠키 읽기
 * - res.cookies.set() - 쿠키 쓰기 (sameSite=none + secure 적용)
 */
export function createMiddlewareClient(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          const merged = { name, value, ...options, ...crossDomainCookieOptions() }
          req.cookies.set(merged)
          res.cookies.set(merged)
        },
        remove(name: string, options: CookieOptions) {
          const merged = { name, value: '', ...options, ...crossDomainCookieOptions() }
          req.cookies.set(merged)
          res.cookies.set(merged)
        },
      },
    }
  )

  return { supabase, response: res }
}
