/**
 * /api/auth/* 경로에 공통으로 적용할 CORS 헬퍼
 * Framer(ktmarket.co.kr)에서 크로스 도메인 fetch 허용
 */
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':
      process.env.NEXT_PUBLIC_FRAMER_SITE_URL || 'https://ktmarket.co.kr',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}
