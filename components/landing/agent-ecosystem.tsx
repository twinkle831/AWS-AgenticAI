"use client"

import { useScrollAnimate } from "@/hooks/use-scroll-animate"

const AGENTS = [
  {
    name: "Inventory Manager",
    metric: "Current Stock",
    metricValue: "75%",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
    subItems: [
      { icon: "chart", label: "IOT Data Acquisition Threshold" },
      { icon: "alert", label: "Dynamic Pricing: +3% on SKU-402" },
    ],
    barPercent: 75,
  },
  {
    name: "Pricing Agent",
    metric: "Market Feed",
    metricValue: "Live",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    subItems: [
      { icon: "chart", label: "Competitor price analysis active" },
      { icon: "alert", label: "Dynamic Pricing: +3% on SKU-402" },
    ],
    barPercent: 0,
  },
  {
    name: "Customer Service",
    metric: "Dynamic Pricing",
    metricValue: "+$5 on SKU-402",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    subItems: [
      { icon: "chart", label: "Auto-resolved 68% of tier-1 queries" },
      { icon: "alert", label: "Loyalty tier upgrade: CUST-189" },
    ],
    barPercent: 0,
  },
  {
    name: "Logistics",
    metric: "Health OK",
    metricValue: "Next check in 15h",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 17h4V5H2v12h3" />
        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
    subItems: [
      { icon: "chart", label: "Route optimization complete" },
      { icon: "alert", label: "Physical Store Updates" },
    ],
    barPercent: 0,
  },
]

export function AgentEcosystem() {
  const { ref, isVisible } = useScrollAnimate<HTMLElement>(0.1)

  return (
    <section ref={ref} id="ecosystem" className="relative py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <h2
          className={`text-3xl font-bold text-[#e0e0e0] mb-10 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          The Agent Ecosystem
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              className={`group rounded-xl border border-[#0f2a1f] bg-[#080f18] p-5 transition-all duration-700 hover:border-[#00f0b5]/30 hover:shadow-[0_0_30px_rgba(0,240,181,0.05)] ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#e0e0e0]">{agent.name}</h3>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00f0b5]/10 border border-[#00f0b5]/20">
                  {agent.icon}
                </div>
              </div>

              {/* Metric */}
              <div className="mb-3">
                <span className="text-xs text-[#6b7d94]">{agent.metric}</span>
                {agent.barPercent > 0 ? (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1a2332]">
                      <div
                        className="h-full rounded-full bg-[#00f0b5] transition-all duration-1000"
                        style={{ width: isVisible ? `${agent.barPercent}%` : "0%" }}
                      />
                    </div>
                    <span className="text-xs font-mono font-medium text-[#00f0b5]">{agent.metricValue}</span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm font-medium text-[#e0e0e0]">{agent.metricValue}</p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[#0f2a1f] my-3" />

              {/* Sub items */}
              <div className="flex flex-col gap-2">
                {agent.subItems.map((sub, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="h-5 w-5 flex items-center justify-center rounded bg-[#0f2a1f]">
                      {sub.icon === "chart" ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00f0b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-[#6b7d94] leading-tight">{sub.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
