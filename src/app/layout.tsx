import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./provider";
import { defaultMetadata } from "@/src/lib/seo";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-label-900" suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen flex-col">
            {/* Header는 서버 컴포넌트로 동작하여 SSR 최적화 */}
            <Header />
            
            {/* 페이지별 콘텐츠가 들어가는 영역 */}
            <main className="flex-1">
              {children}
            </main>

            {/* 모든 페이지 공통 하단 */}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}