import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // request.url에서 현재 API가 실행 중인 서버의 origin 
  // (예: http://localhost:3000 또는 https://kt-market-puce.vercel.app)
  const { searchParams, origin } = new URL(request.url);
  const provider = searchParams.get("provider");

  // 1. API를 처리하는 백엔드(Next.js) 도메인 
  // 동적으로 파악하므로 로컬과 Vercel 배포 모두 알아서 호환됩니다.
  const apiServerUrl = origin;

  // 2. 접속 중인 프론트엔드(Framer) 도메인
  // 기존 `.env`에 있던 NEXT_PUBLIC_FRAMER_SITE_URL을 활용하고 기본값을 맞춰줍니다.
  const frontendUrl = process.env.NEXT_PUBLIC_FRAMER_SITE_URL || "https://ktmarket.co.kr";

  // 카카오(Kakao) 로그인 - Supabase OAuth 연동 처리
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
        // 인증 성공 후 코드를 전달받을 콜백은 Next.js 서버(apiServerUrl) 쪽으로 설정
        redirectTo: `${apiServerUrl}/api/auth/callback`,
      },
    });

    if (error || !data?.url) {
      console.error("카카오 OAuth 인증 URL 생성 실패:", error);
      return NextResponse.redirect(`${frontendUrl}/?error=kakao_auth_failed`);
    }

    // 성공 시 제공된 카카오 서버 로그인 화면으로 리다이렉트
    return NextResponse.redirect(data.url);
  }

  // 네이버(Naver) 로그인 - NextAuth 연동 처리
  if (provider === "naver") {
    // NextAuth의 로그인 흐름은 Next.js 서버(apiServerUrl)에서 처리
    // 로그인이 완료된 뒤 다시 Framer 웹사이트(frontendUrl)로 돌아가기 위해 callbackUrl 지정
    const nextAuthUrl = `${apiServerUrl}/api/auth/signin/naver?callbackUrl=${encodeURIComponent(frontendUrl)}`;
    return NextResponse.redirect(nextAuthUrl);
  }

  // 잘못된 플랫폼 식별자가 넘어올 경우 안전하게 프론트엔드 홈으로 리다이렉트
  return NextResponse.redirect(`${frontendUrl}/?error=invalid_provider_request`);
}
