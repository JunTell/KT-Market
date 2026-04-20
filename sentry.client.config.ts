// Sentry 클라이언트 설정
// npm install @sentry/nextjs 실행 후 활성화
// 환경변수: NEXT_PUBLIC_SENTRY_DSN 설정 필요

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // JS 오류 원본 확보를 위한 설정
  // Script error 94.92%가 CORS 마스킹 → crossorigin 설정으로 해결
  tracesSampleRate: 0.1, // 성능 트레이스 10% 샘플링
  replaysSessionSampleRate: 0.05, // 세션 리플레이 5%
  replaysOnErrorSampleRate: 0.5, // 오류 발생 시 50% 리플레이

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // 불필요한 오류 필터링
  ignoreErrors: [
    "ResizeObserver loop",
    "Non-Error promise rejection",
    /Loading chunk \d+ failed/,
  ],

  beforeSend(event) {
    // Script error는 이제 crossorigin 설정으로 원본 확보 가능
    // 그래도 빈 Script error만 오면 필터링
    if (
      event.exception?.values?.[0]?.value === "Script error." &&
      !event.exception?.values?.[0]?.stacktrace?.frames?.length
    ) {
      return null
    }
    return event
  },
})
