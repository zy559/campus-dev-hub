import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import RevealObserver from "@/components/ui/RevealObserver";
import ContentShell from "@/components/layout/ContentShell";
import BottomNav from "@/components/layout/BottomNav";
import { Providers } from "./providers";
import { Suspense } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "围炉 · Campfire",
  description: "围炉 · Campfire — 校园技术交流社区，分享、学习、组队",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("campus-dev-hub-theme");if(t==="dark"){document.documentElement.setAttribute("data-theme","dark")}})()`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-ink min-h-screen flex flex-col relative`}>
        {/* Subtle gradient background — fixed behind everything */}
        <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-surface" />
          <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.12] bg-accent" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08] bg-accent" />
        </div>

        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-md focus:outline-none"
          >
            跳转到主要内容
          </a>
          <NavBar />
          <RevealObserver />
          <main id="main-content" className="flex-1">
            <Suspense fallback={null}>
              <ContentShell>{children}</ContentShell>
            </Suspense>
          </main>
          <div className="hidden lg:block"><Footer /></div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
