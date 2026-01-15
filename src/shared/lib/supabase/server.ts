import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

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
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component에서는 cookies().set()이 작동하지 않을 수 있음
            // Route Handler나 Server Action에서만 사용 가능
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
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
 * - res.cookies.set() - 쿠키 쓰기
 * - HTTP-Only + Secure 플래그로 안전한 세션 관리
 */
export function createMiddlewareClient(req: NextRequest) {
  // Response 객체를 미리 생성하여 쿠키 설정에 사용
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
          // Request와 Response 양쪽에 쿠키 설정
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Request와 Response 양쪽에서 쿠키 제거
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  return { supabase, response: res }
}