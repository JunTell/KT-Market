// src/auth.ts
import NextAuth from "next-auth";
import NaverProvider from "next-auth/providers/naver";
import { createClient } from "@supabase/supabase-js";

// 서버 환경에서 동작하는 Supabase Admin 클라이언트 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    NaverProvider({
      clientId: process.env.AUTH_NAVER_ID || "",
      clientSecret: process.env.AUTH_NAVER_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "naver") {
        try {
          const naverId = account.providerAccountId;

          // 네이버 로그인은 Supabase Auth (auth.users)를 거치지 않으므로,
          // naver_id를 기준으로 public.profiles에 직접 upsert 진행.
          const { data, error } = await supabaseAdmin
            .from("profiles")
            .upsert(
              {
                naver_id: naverId,
                email: user.email || null,
                full_name: user.name || null,
                avatar_url: user.image || null,
                provider: "naver",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "naver_id", ignoreDuplicates: false }
            )
            .select("id")
            .single();

          if (error) throw error;

          // NextAuth의 JWT 및 Session에서 식별 가능하도록 로컬 UUID 할당
          user.id = data.id;
        } catch (error) {
          console.error("Naver profile upsert failed:", error);
          // DB 동기화 실패 시 사이드 이펙트 방지를 위해 로그인 거절 취급
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
        token.naverId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.naverId = token.naverId as string;
      }
      return session;
    },
  },
});
