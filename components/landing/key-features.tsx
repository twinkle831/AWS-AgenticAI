"use client"

import { useScrollAnimate } from "@/hooks/use-scroll-animate"

const FEATURES = [
  {
    title: "Automated Reordering",
    description: "Never hit zero. AI monitors stock levels and triggers purchase orders before thresholds are crossed.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2" />
      </svg>
    ),
  },
  {
    title: "Staff Optimization",
    description: "Agents predict peak hours and recommend optimal staffing levels to minimize labor costs.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Predictive Analytics",
    description: "Agents analyze historical data to predict demand spikes, equipment failure, and revenue trends.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: "Customer Notifications",
    description: "Personalized loyalty pings, tier upgrades, and targeted offers delivered automatically by the service agent.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
]

export function KeyFeatures() {
  const { ref, isVisible } = useScrollAnimate<HTMLElement>(0.1)

  return (
    <section ref={ref} id="features" className="relative py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <h2
          className={`text-3xl font-bold text-[#e0e0e0] mb-10 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Key Performance Features
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`group flex items-start gap-4 rounded-xl border border-[#0f2a1f] bg-[#080f18] p-6 transition-all duration-700 hover:border-[#00f0b5]/30 hover:shadow-[0_0_30px_rgba(0,240,181,0.05)] ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00f0b5]/10 border border-[#00f0b5]/20 group-hover:bg-[#00f0b5]/15 transition-colors">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#e0e0e0] mb-1">{feature.title}</h3>
                <p className="text-sm text-[#6b7d94] leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
