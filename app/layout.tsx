import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import NavBar from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import RevealObserver from "@/components/ui/RevealObserver";
import ContentShell from "@/components/layout/ContentShell";
import BottomNav from "@/components/layout/BottomNav";
import { Providers } from "./providers";

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
  title: "围炉 Campfire - 找到同校同频的人",
  description: "围炉是面向校园学生的伙伴社区，帮助你找到比赛队友、学习搭子、项目伙伴和同频朋友。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.pexels.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("campus-dev-hub-theme");if(t==="dark"){document.documentElement.setAttribute("data-theme","dark")}else{document.documentElement.removeAttribute("data-theme")}})()`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-ink min-h-screen flex flex-col relative bg-[#f7fafc]`}>
        <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f4fbfb_42%,#f8fafc_100%)]" />
          <div className="absolute left-[-12%] top-[-10%] h-[420px] w-[420px] rounded-full bg-teal-100/55 blur-3xl" />
          <div className="absolute right-[-10%] top-[18%] h-[360px] w-[360px] rounded-full bg-sky-100/55 blur-3xl" />
          <div className="absolute bottom-[-16%] left-[24%] h-[420px] w-[420px] rounded-full bg-emerald-50/80 blur-3xl" />
        </div>

        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-white focus:outline-none"
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
          <div className="hidden lg:block">
            <Footer />
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
