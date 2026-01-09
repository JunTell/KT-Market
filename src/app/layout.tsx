import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./provider";
import { defaultMetadata } from "@/src/shared/lib/seo";
import AuthStateListener from "@/src/shared/ui/AuthStateListener";

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
      <body suppressHydrationWarning>
        <Providers>
          <AuthStateListener />
          <div className="flex justify-center min-h-screen">
            <div className="w-full max-w-[940px] min-w-[360px] bg-background shadow-xl min-h-screen overflow-x-hidden">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}