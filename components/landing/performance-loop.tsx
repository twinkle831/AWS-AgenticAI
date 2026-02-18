"use client"

import { useScrollAnimate } from "@/hooks/use-scroll-animate"

const LOOP_STEPS = [
  {
    label: "IOT Data Ingestion",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    label: "Step Functions & CrewAI Engine",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    label: "Agent Execution",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

const LOOP_BOTTOM = [
  {
    label: "Action Feedback",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    ),
  },
  {
    label: "Agent Aggregation",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    label: "Physical Store Update",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
]

function Arrow() {
  return (
    <div className="flex items-center justify-center px-2">
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
        <path d="M0 8H28M28 8L22 2M28 8L22 14" stroke="#00f0b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    </div>
  )
}

export function PerformanceLoop() {
  const { ref, isVisible } = useScrollAnimate<HTMLElement>(0.1)

  return (
    <section ref={ref} className="relative py-24 px-6 overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00f0b5]/3 blur-[150px]" />

      <div className="relative mx-auto max-w-6xl">
        <h2
          className={`text-3xl font-bold text-[#e0e0e0] mb-12 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Key Performance Loop
        </h2>

        {/* Top row flow */}
        <div
          className={`flex items-center justify-center mb-12 transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {LOOP_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#0f2a1f] bg-[#080f18] shadow-[0_0_20px_rgba(0,240,181,0.05)]">
                  {step.icon}
                </div>
                <span className="text-xs text-[#8a9bb0] text-center max-w-[120px]">{step.label}</span>
              </div>
              {i < LOOP_STEPS.length - 1 && <Arrow />}
            </div>
          ))}
        </div>

        {/* Curved return arrow (simple visual) */}
        <div
          className={`flex items-center justify-center mb-12 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg width="400" height="60" viewBox="0 0 400 60" fill="none" className="mx-auto">
            <path
              d="M350 5 C 380 5, 395 30, 380 55 L 200 55 L 20 55 C 5 55, 5 30, 30 5"
              stroke="#00f0b5"
              strokeWidth="1"
              strokeDasharray="6 4"
              opacity="0.3"
              fill="none"
            />
            <polygon points="30,0 30,10 22,5" fill="#00f0b5" opacity="0.4" />
          </svg>
        </div>

        {/* Bottom row flow */}
        <div
          className={`flex items-center justify-center transition-all duration-1000 delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {LOOP_BOTTOM.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#0f2a1f] bg-[#080f18] shadow-[0_0_20px_rgba(0,240,181,0.05)]">
                  {step.icon}
                </div>
                <span className="text-xs text-[#8a9bb0] text-center max-w-[120px]">{step.label}</span>
              </div>
              {i < LOOP_BOTTOM.length - 1 && <Arrow />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
