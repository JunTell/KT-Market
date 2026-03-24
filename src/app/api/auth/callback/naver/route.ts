import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  // 인가 요청 때 인코딩해 넘긴 클라이언트 프론트엔드 URL
  const state = searchParams.get("state"); 
  
  // 프론트엔드 URL 복구 (만약 값이 없다면 기본 환경 변수를 사용해 복원)
  const frontendUrl = state
    ? decodeURIComponent(state)
    : (process.env.NODE_ENV === "development" 
        ? "http://localhost:3000" 
        : (process.env.NEXT_PUBLIC_FRAMER_SITE_URL || "https://ktmarket.co.kr"));

  if (!code) {
    console.error("네이버 인가 코드가 없습니다.");
    return NextResponse.redirect(`${frontendUrl}/?error=missing_naver_code`);
  }

  const clientId = process.env.AUTH_NAVER_ID;
  const clientSecret = process.env.AUTH_NAVER_SECRET;
  
  if (!clientId || !clientSecret) {
    console.error("네이버 클라이언트 환경변수가 누락되었습니다.");
    return NextResponse.redirect(`${frontendUrl}/?error=naver_server_config_error`);
  }

  try {
    // 1. 발급받은 code를 사용하여 네이버 Access Token 요청
    const tokenResponse = await fetch(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&state=${state}`, 
      { method: "GET" }
    );

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("네이버 토큰 발급 실패:", tokenData);
      return NextResponse.redirect(`${frontendUrl}/?error=naver_token_fetch_failed`);
    }

    // 2. 획득한 네이버 Access Token으로 네이버 내부 프로필 정보 조회
    const profileResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profileData = await profileResponse.json();
    if (!profileResponse.ok || profileData.resultcode !== "00") {
      console.error("네이버 프로필 조회 실패:", profileData);
      return NextResponse.redirect(`${frontendUrl}/?error=naver_profile_fetch_failed`);
    }

    // 3. 네이버 유저 프로필 정보 추출 
    const { id: naverId, email, name, mobile } = profileData.response;

    if (!email) {
      console.error("네이버 프로필에 이메일이 포함되어 있지 않습니다.");
      return NextResponse.redirect(`${frontendUrl}/?error=naver_email_required`);
    }

    // 4. Supabase Admin 클라이언트 생성 (Service Role Key 필수 사용)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase 서비스 역할 키(Service Role Key)가 누락되었습니다.");
      return NextResponse.redirect(`${frontendUrl}/?error=supabase_config_error`);
    }

    // autoRefreshToken, persistSession을 끄고 순수 백엔드에서만 세션 관리 없이 사용되게 구성
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 5. 유추 불가한 더미 비밀번호 해시 생성 (네이버 고유 식별자 및 환경변수 해시 믹스)
    const dummyPassword = crypto
      .createHash("sha256")
      .update(`${naverId}_${process.env.AUTH_SECRET}_naver_social_salt`)
      .digest("hex");

    // 6. 생성한 더미 비밀번호와 확인된 이메일로 Supabase SignIn(로그인) 시도
    let { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: dummyPassword,
    });

    // 기존 회원이 아닐 경우 에러 리턴, 이 경우 신규 유저로 간주하고 강제 생성 및 가입 진행
    if (signInError) {
      console.log(`[네이버 로그인] 기존 유저가 아닙니다. 신규 유저 가입을 진행합니다: ${email}`);
      
      const { error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: dummyPassword,
        email_confirm: true, // 소셜 로그인으로 인증된 계정이므로 자동 이메일 확정(Confirmed) 설정
        user_metadata: {
          name,
          phone: mobile,
          provider: "naver",
          naver_id: naverId,
        },
      });

      if (signUpError) {
        console.error("Supabase 신규 유저 생성 실패:", signUpError);
        return NextResponse.redirect(`${frontendUrl}/?error=supabase_user_creation_failed`);
      }

      // 회원 생성 이후 다시 로그인 시도하여 정상적인 세션을 발급 받음
      const retrySignIn = await supabaseAdmin.auth.signInWithPassword({
        email,
        password: dummyPassword,
      });

      authData = retrySignIn.data;
      
      if (retrySignIn.error) {
         console.error("신규 유저 생성 후 자동 로그인 실패:", retrySignIn.error);
         return NextResponse.redirect(`${frontendUrl}/?error=supabase_auto_login_failed`);
      }
    }

    // 7. 정상 로그인된 유저의 Supabase Auth 객체에서 프론트엔드가 사용할 진짜 세션값 추출
    const session = authData?.session;
    if (!session) {
      return NextResponse.redirect(`${frontendUrl}/?error=supabase_session_empty`);
    }

    const { access_token, refresh_token, expires_in } = session;

    // 8. Framer 프론트엔드 URL의 URL 해시 프래그먼트에 세션 정보 포함 후 최종 리다이렉트
    // (Supabase 프론트엔드 클라이언트가 자동으로 URL 해시에서 세션을 파싱하여 브라우저에 복구함)
    const finalRedirectUrl = `${frontendUrl}/#access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}&token_type=bearer&type=recovery`;

    return NextResponse.redirect(finalRedirectUrl);

  } catch (err) {
    console.error("네이버 콜백 처리 로직 런타임 에러:", err);
    return NextResponse.redirect(`${frontendUrl}/?error=internal_server_error`);
  }
}
