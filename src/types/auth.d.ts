import type { DefaultSession } from "next-auth";

// Extended session to include internal UUID and Naver ID.
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string; // The Supabase public.profiles UUID
      naverId?: string; // The external canonical Naver identity
    } & DefaultSession["user"];
  }
}
