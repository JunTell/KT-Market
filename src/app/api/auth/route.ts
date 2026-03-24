import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const origin = request.nextUrl.origin;
  const provider = searchParams.get("provider")?.toLowerCase();

  const apiServerUrl = origin;

  // 개발 환경(localhost)과 프로덕션(ktmarket.co.kr) 동적 분기
  const frontendUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : (process.env.NEXT_PUBLIC_FRAMER_SITE_URL || "https://ktmarket.co.kr");

  if (provider === "kakao") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase 환경 변수가 설정되지 않았습니다.");
      return NextResponse.redirect(`${frontendUrl}/?error=config_missing`);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        // ✅ 수정된 부분: 토큰을 포함한 리다이렉트를 프론트엔드(Framer)로 직접 보냅니다.
        redirectTo: frontendUrl,
      },
    });

    if (error || !data?.url) {
      console.error("카카오 OAuth 인증 URL 생성 실패:", error);
      return NextResponse.redirect(`${frontendUrl}/?error=kakao_auth_failed`);
    }

    return NextResponse.redirect(data.url);
  }

  if (provider === "naver") {
    // 네이버(NextAuth)의 경우 세션 쿠키를 사용한다면 기존 방식 유지, 
    // 혹은 Framer 전역 상태와 맞추려면 별도의 콜백 페이지 처리가 필요할 수 있습니다.
    const nextAuthUrl = `${apiServerUrl}/api/auth/signin/naver?callbackUrl=${encodeURIComponent(frontendUrl)}`;
    return NextResponse.redirect(nextAuthUrl);
  }

  return NextResponse.redirect(`${frontendUrl}/?error=invalid_provider_request`);
}