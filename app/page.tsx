"use client"

import { LandingNav } from "@/components/landing/landing-nav"
import { HeroSection } from "@/components/landing/hero-section"
import { AgentEcosystem } from "@/components/landing/agent-ecosystem"
import { PerformanceLoop } from "@/components/landing/performance-loop"
import { KeyFeatures } from "@/components/landing/key-features"
import { TechArchitecture } from "@/components/landing/tech-architecture"
import { CTASection } from "@/components/landing/cta-section"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060b12] text-[#e0e0e0] overflow-x-hidden">
      <LandingNav />
      <main>
        <HeroSection />
        <AgentEcosystem />
        <PerformanceLoop />
        <KeyFeatures />
        <TechArchitecture />
        <CTASection />
      </main>
      {/* Footer */}
      <footer className="border-t border-[#0f2a1f] bg-[#040810] py-10 px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
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
          <p className="text-xs text-[#4a5568]">Built with CrewAI, AWS Bedrock & Step Functions</p>
        </div>
      </footer>
    </div>
  )
}
