/**
 * /api/auth/* 경로에 공통으로 적용할 CORS 헬퍼
 * credentials: 'include' 와 함께 사용하므로 wildcard * 사용 불가 — 허용 목록 방식 사용
 */
const DEFAULT_ALLOWED_ORIGINS = [
  'https://smaller-process-561216.framer.app',
  'https://ktmarket.co.kr',
]

function getAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS
  if (env) {
    return [
      ...DEFAULT_ALLOWED_ORIGINS,
      ...env.split(',').map((o) => o.trim()).filter(Boolean),
    ]
  }
  return DEFAULT_ALLOWED_ORIGINS
}

export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowed = getAllowedOrigins()
  const isAllowed = requestOrigin && allowed.includes(requestOrigin)

  // 허용되지 않은 origin은 CORS 헤더를 내보내지 않음
  // (브라우저가 차단하더라도 허용 도메인 정보를 응답에 노출하지 않음)
  if (!isAllowed) {
    return { 'Vary': 'Origin' }
  }

  return {
    'Access-Control-Allow-Origin': requestOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  }
}
