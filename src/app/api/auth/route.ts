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
    const clientId = process.env.AUTH_NAVER_ID;
    
    // 현재 요청이 들어온 도메인(origin)을 네이버의 Callback URI로 설정합니다.
    const redirectUri = `${request.nextUrl.origin}/api/auth/callback/naver`;

    if (!clientId) {
      console.error("네이버 클라이언트 ID(AUTH_NAVER_ID)가 설정되지 않았습니다.");
      return NextResponse.redirect(`${frontendUrl}/?error=config_missing`);
    }

    // 네이버 인증 완료 후 돌아갈 목적지 프론트엔드 도메인을 state에 담아 인코딩합니다.
    const state = encodeURIComponent(frontendUrl);

    // 네이버 사용자 인가 URL 생성
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    return NextResponse.redirect(naverAuthUrl);
  }

  return NextResponse.redirect(`${frontendUrl}/?error=invalid_provider_request`);
}