import { createBrowserClient } from '@supabase/ssr'

/**
 * 브라우저(클라이언트) 전용 Supabase 클라이언트
 *
 * localStorage 기반 세션 관리:
 * - 브라우저의 localStorage에 세션 저장
 * - 자바스크립트에서 접근 가능
 * - provider_token (카카오, 구글 등) 포함
 * - Client Component에서 사용
 *
 * 주의:
 * - 서버에서는 사용 불가 (localStorage가 없음)
 * - 민감한 정보는 서버 쿠키를 통해 관리됨
 */
export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const createSupabaseBrowserClient = () => supabaseClient;