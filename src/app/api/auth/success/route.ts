import { NextResponse } from 'next/server';

import { auth } from '@/src/auth';

/**
 * NextAuth(Auth.js) 로그인 완료 후 리다이렉트 되는 중간 엔드포인트
 * 세션 토큰을 쿼리로 감싸고 Framer 프론트엔드로 다시 돌려보냅니다.
 */
export async function GET() {
  const session = await auth();
  
  // Framer 호스팅 도메인 (리다이렉트 목적지)
  const framerBaseUrl = process.env.NEXT_PUBLIC_HOME_URL || 'https://ktmarket.co.kr';

  if (!session || !session.accessToken) {
    return NextResponse.redirect(`${framerBaseUrl}/login?error=auth_failed`);
  }

  // Framer 프론트엔드로 돌아가면서 url 파라미터로 access_token 전달
  const redirectUrl = new URL(framerBaseUrl);
  redirectUrl.searchParams.set('access_token', session.accessToken);

  return NextResponse.redirect(redirectUrl.toString());
}
