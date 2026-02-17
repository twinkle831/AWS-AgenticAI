"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

const STATUS_MESSAGES = [
  "Inventory Agent: Visibility on SKU-76 is critically low, replenishment order submitted to Flexitab Sourcer. Estimated arrival: next Wed.",
  "Pricing Agent: Dynamic pricing engaged on SKU-402 -- margin increase of +$5 applied based on demand surge analysis.",
  "Maintenance Agent: Health check on HVAC Unit #3 flagged -- scheduling preventive repair for Thursday window.",
  "Logistics Agent: Route optimization complete. 3 deliveries consolidated, ETA improved by 42 minutes.",
  "Customer Service Agent: Loyalty tier upgrade processed for CUST-189. Personalized offer dispatched via email.",
]

function OrchestratorDiagram() {
  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96">
      {/* Glow backdrop */}
      <div className="absolute inset-0 rounded-full bg-[#00f0b5]/5 blur-3xl" />

      {/* Center hexagon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120" className="animate-[spin_20s_linear_infinite]">
            <polygon
              points="60,5 110,30 110,90 60,115 10,90 10,30"
              fill="none"
              stroke="#00f0b5"
              strokeWidth="1.5"
              opacity="0.4"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-[#00f0b5]">The</span>
            <span className="text-sm font-bold text-[#00f0b5]">Orchestrator</span>
          </div>
        </div>
      </div>

      {/* Orbiting nodes */}
      {[
        { label: "Inventory", angle: -90, delay: "0s" },
        { label: "Pricing", angle: -18, delay: "0.5s" },
        { label: "Logistics", angle: 54, delay: "1s" },
        { label: "Maintenance", angle: 126, delay: "1.5s" },
        { label: "Customer", angle: 198, delay: "2s" },
      ].map((node) => {
        const rad = (node.angle * Math.PI) / 180
        const radius = 140
        const x = 50 + (radius / 3.2) * Math.cos(rad)
        const y = 50 + (radius / 3.2) * Math.sin(rad)
        return (
          <div
            key={node.label}
            className="absolute flex flex-col items-center gap-1 animate-[fadeIn_0.6s_ease-out_forwards] opacity-0"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: node.delay,
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#00f0b5]/40 bg-[#00f0b5]/10 shadow-[0_0_20px_rgba(0,240,181,0.15)]">
              <div className="h-2.5 w-2.5 rounded-full bg-[#00f0b5]" />
            </div>
            <span className="text-xs font-medium text-[#00f0b5]/80 whitespace-nowrap">{node.label}</span>
          </div>
        )
      })}

      {/* Orbiting ring */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="#00f0b5"
          strokeWidth="0.5"
          strokeDasharray="4 8"
          opacity="0.25"
          className="animate-[spin_30s_linear_infinite]"
          style={{ transformOrigin: "center" }}
        />
      </svg>
    </div>
  )
}

function LiveStatusFeed() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const message = STATUS_MESSAGES[currentIndex]
    let charIndex = 0
    setIsTyping(true)
    setDisplayedText("")

    const typeInterval = setInterval(() => {
      if (charIndex < message.length) {
        setDisplayedText(message.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typeInterval)
        setIsTyping(false)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % STATUS_MESSAGES.length)
        }, 3000)
      }
    }, 20)

    return () => clearInterval(typeInterval)
  }, [currentIndex])

  return (
    <div className="rounded-xl border border-[#0f2a1f] bg-[#080f18] p-5 max-w-sm w-full">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[#00f0b5] animate-pulse" />
        <span className="text-xs font-semibold text-[#00f0b5] uppercase tracking-wider">Live Status Agent</span>
      </div>
      <p className="text-xs text-[#8a9bb0] leading-relaxed font-mono min-h-[60px]">
        &quot;{displayedText}
        {isTyping && <span className="animate-pulse text-[#00f0b5]">|</span>}
        &quot;
      </p>
      <div className="mt-3 flex items-center gap-1.5">
        {STATUS_MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i === currentIndex ? "bg-[#00f0b5]" : i < currentIndex ? "bg-[#00f0b5]/30" : "bg-[#1a2332]"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#00f0b5 1px, transparent 1px), linear-gradient(90deg, #00f0b5 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top-left radial glow */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#00f0b5]/5 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6 w-full">
        <div className="flex flex-col items-start gap-12 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: copy */}
          <div
            className={`max-w-lg transition-all duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#e0e0e0] md:text-5xl lg:text-6xl text-balance">
              The Store That{" "}
              <span className="text-[#00f0b5]">Runs Itself</span>
            </h1>
            <p className="mt-5 text-base text-[#8a9bb0] leading-relaxed max-w-md">
              Deploy a multi-agent ecosystem that orchestrates inventory, pricing, logistics in real-time.
              Built with CrewAI and AWS Step Functions.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/"
                className="group relative inline-flex items-center gap-2 rounded-lg bg-[#00f0b5] px-6 py-3 text-sm font-semibold text-[#060b12] transition-all hover:shadow-[0_0_30px_rgba(0,240,181,0.3)]"
              >
                Deploy Your Demo
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#ecosystem"
                className="inline-flex items-center gap-2 rounded-lg border border-[#1a2332] bg-[#0a1018] px-6 py-3 text-sm font-medium text-[#8a9bb0] hover:border-[#00f0b5]/30 hover:text-[#e0e0e0] transition-all"
              >
                Watch the Demo
              </a>
            </div>
          </div>

          {/* Center: orchestrator */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              mounted ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          >
            <OrchestratorDiagram />
          </div>

          {/* Right: live status */}
          <div
            className={`transition-all duration-1000 delay-500 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <LiveStatusFeed />
          </div>
        </div>
      </div>
    </section>
  )
}
