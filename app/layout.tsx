import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { LoadingProvider } from "@/lib/loading-context"
import { GlobalLoadingIndicator } from "@/components/global-loading-indicator"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { Suspense } from "react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "E-Commerce Store - Shop Online",
  description: "Your one-stop shop for quality products",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans">
        <LoadingProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <AuthProvider>
              <CartProvider>
                <GlobalLoadingIndicator />
                {children}
                <Toaster />
              </CartProvider>
            </AuthProvider>
          </Suspense>
        </LoadingProvider>
        <Analytics />
      </body>
    </html>
  )
}
