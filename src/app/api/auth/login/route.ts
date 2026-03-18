import { signIn } from "@/src/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  // 제공자 검증
  const allowedProviders = ['kakao', 'naver'];

  if (!provider || !allowedProviders.includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  // NextAuth v5 signin 함수 호출 (Framer 로그인 콜백을 위해 /api/auth/success 로 리다이렉트 지시)
  // GET 라우트 핸들러 내에서 호출하면 자동으로 제공자 페이지로 리다이렉트 응답을 반환합니다.
  return await signIn(provider, { 
    redirectTo: '/api/auth/success' 
  });
}
