import type React from "react"
import type { Metadata } from "next"
//import { Geist, Geist_Mono } from "next/font/google"
import { GeistSans, GeistMono } from "geist/font"
import { Analytics } from "@vercel/analytics/next"
import { ClientProviders } from "@/components/client-providers"
import "./globals.css"

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// })

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// })

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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="font-sans h-screen">
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  )
}
