"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#060b12]/90 backdrop-blur-lg border-b border-[#0f2a1f]/50" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00f0b5]/20 border border-[#00f0b5]/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#e0e0e0] tracking-tight">StoreOps AI</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#ecosystem" className="text-sm text-[#8a9bb0] hover:text-[#00f0b5] transition-colors">
            Domains
          </a>
          <a href="#features" className="text-sm text-[#8a9bb0] hover:text-[#00f0b5] transition-colors">
            Features
          </a>
          <a href="#architecture" className="text-sm text-[#8a9bb0] hover:text-[#00f0b5] transition-colors">
            Architecture
          </a>
        </nav>

        <Link
          href="/"
          className="rounded-lg bg-[#00f0b5]/10 border border-[#00f0b5]/30 px-4 py-2 text-sm font-medium text-[#00f0b5] hover:bg-[#00f0b5]/20 transition-all"
        >
          Open Dashboard
        </Link>
      </div>
    </header>
  )
}
