import type { Metadata } from "next";

import localFont from "next/font/local";

import "./globals.css";
import { defaultMetadata } from "@/src/shared/lib/seo";

import AuthStateListener from "../shared/ui/AuthStateListener";

import { Providers } from "./provider";

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
          {children}
        </Providers>
      </body>
    </html>
  );
}