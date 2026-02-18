"use client"

import { useScrollAnimate } from "@/hooks/use-scroll-animate"

const LAYERS = [
  {
    label: "Frontend",
    items: ["React / Next.js Dashboard", "MQTT / WebSocket Streams"],
    color: "#00f0b5",
  },
  {
    label: "Agent Layer",
    items: ["Python-based Agent Swarm (CrewAI Framework)", "DynamoDB + AWS Step Functions"],
    color: "#3b82f6",
  },
  {
    label: "Infrastructure",
    items: ["Terraformed Store Architectures", "IOT Core Integration"],
    color: "#f59e0b",
  },
]

function ArchNode({ label, color, delay, isVisible }: { label: string; color: string; delay: number; isVisible: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-[#080f18] px-4 py-3 transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{
        borderColor: `${color}30`,
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm text-[#e0e0e0]">{label}</span>
    </div>
  )
}

function ConnectorLine({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center py-2">
      <svg width="2" height="24" viewBox="0 0 2 24">
        <line x1="1" y1="0" x2="1" y2="24" stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
      </svg>
    </div>
  )
}

export function TechArchitecture() {
  const { ref, isVisible } = useScrollAnimate<HTMLElement>(0.1)

  return (
    <section ref={ref} id="architecture" className="relative py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <h2
          className={`text-3xl font-bold text-[#e0e0e0] mb-3 text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Technical Architecture
        </h2>
        <p
          className={`text-center text-sm text-[#6b7d94] mb-12 transition-all duration-700 delay-100 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Three-layer architecture powering autonomous store operations
        </p>

        <div className="flex flex-col items-center">
          {LAYERS.map((layer, li) => (
            <div key={layer.label} className="w-full max-w-2xl">
              {/* Layer label */}
              <div
                className={`mb-3 flex items-center gap-2 transition-all duration-700 ${
                  isVisible ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"
                }`}
                style={{ transitionDelay: `${li * 200}ms` }}
              >
                <div className="h-1 w-6 rounded-full" style={{ backgroundColor: layer.color }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: layer.color }}>
                  {layer.label}
                </span>
              </div>

              {/* Items */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {layer.items.map((item, ii) => (
                  <ArchNode
                    key={item}
                    label={item}
                    color={layer.color}
                    delay={li * 200 + ii * 100 + 100}
                    isVisible={isVisible}
                  />
                ))}
              </div>

              {/* Connector */}
              {li < LAYERS.length - 1 && <ConnectorLine color={layer.color} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
