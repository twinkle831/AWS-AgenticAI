import type { Metadata, Viewport } from "next"
import { Geist, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "StoreOps AI - Agentic Store Operations",
  description: "Multi-agent AI command center for retail store operations powered by AWS Bedrock and CrewAI.",
}

export const viewport: Viewport = {
  themeColor: "#060b12",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
