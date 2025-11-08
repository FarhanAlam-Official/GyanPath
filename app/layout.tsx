import type React from "react"
import type { Metadata, Viewport } from "next"

import "./globals.css"

import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { OfflineIndicator } from "@/components/offline-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"

import { Inter, Noto_Sans_Devanagari } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "GyanPath - Offline Learning Platform",
  description: "Learn anywhere, anytime with offline-first education",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GyanPath",
  },
  generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#7752FE",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansDevanagari.variable} antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
      </head>
      <body>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <PWAInstallPrompt />
            <OfflineIndicator />
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                      console.log('[v0] Service Worker registered:', registration);
                    },
                    (error) => {
                      console.error('[v0] Service Worker registration failed:', error);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
