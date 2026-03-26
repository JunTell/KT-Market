import { createClient } from '@supabase/supabase-js'

/**
 * Supabase 서비스 롤 클라이언트
 * - RLS 우회 가능 (phone 기반 주문 테이블 조회 등 admin 작업 전용)
 * - 절대 클라이언트 사이드에서 사용 금지
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
