import { QueryClient } from '@tanstack/react-query'

let browserQueryClient: QueryClient | null = null

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // 서버에서는 매 요청마다 새로 생성
    return new QueryClient()
  }

  if (!browserQueryClient) {
    browserQueryClient = new QueryClient()
  }

  return browserQueryClient
}