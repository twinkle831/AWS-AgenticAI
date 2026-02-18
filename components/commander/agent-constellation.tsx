"use client"

import { useMemo } from "react"
import { AGENTS, type AgentId } from "@/lib/commander/scenarios"
import type { AgentState, DebateLink, CommanderPhase } from "@/lib/commander/agent-brain"
import { AgentNode } from "./agent-node"

interface AgentConstellationProps {
  agentStates: Record<AgentId, AgentState>
  activeDebateLinks: DebateLink[]
  phase: CommanderPhase
  currentCommand: string
}

const AGENT_IDS: AgentId[] = ["inventory", "pricing", "maintenance", "customer", "logistics"]

export function AgentConstellation({
  agentStates,
  activeDebateLinks,
  phase,
  currentCommand,
}: AgentConstellationProps) {
  // Pentagon positions - calculated for a 320x320 container
  const positions = useMemo(() => {
    const cx = 175
    const cy = 155
    const radius = 115
    return AGENT_IDS.map((id, i) => {
      const angle = (i / AGENT_IDS.length) * Math.PI * 2 - Math.PI / 2
      return {
        id,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      }
    })
  }, [])

  return (
    <div className="relative h-[350px] w-[350px]">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="text-primary">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Connection lines SVG */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 350 350">
        {/* Passive pentagon outline */}
        <polygon
          points={positions.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="rgba(109, 92, 255, 0.08)"
          strokeWidth="1"
        />

        {/* Cross connections (all-to-all, very faint) */}
        {positions.map((p1, i) =>
          positions.slice(i + 1).map((p2, j) => (
            <line
              key={`passive-${i}-${j}`}
              x1={p1.x} y1={p1.y}
              x2={p2.x} y2={p2.y}
              stroke="rgba(109, 92, 255, 0.04)"
              strokeWidth="0.5"
            />
          ))
        )}

        {/* Active debate links */}
        {activeDebateLinks.filter((l) => l.active).map((link, i) => {
          const from = positions.find((p) => p.id === link.from)
          const to = positions.find((p) => p.id === link.to)
          if (!from || !to) return null
          const fromColor = AGENTS[link.from].color
          const toColor = AGENTS[link.to].color

          return (
            <g key={`debate-${i}`}>
              <defs>
                <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={fromColor} />
                  <stop offset="100%" stopColor={toColor} />
                </linearGradient>
              </defs>
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={`url(#grad-${i})`}
                strokeWidth={1 + link.intensity * 3}
                opacity={0.6 + link.intensity * 0.4}
                className="commander-data-stream"
              />
              {/* Glow */}
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={`url(#grad-${i})`}
                strokeWidth={4 + link.intensity * 6}
                opacity={0.15}
                filter="blur(3px)"
              />
            </g>
          )
        })}
      </svg>

      {/* Center status */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-[140px] text-center">
          {phase === "processing" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary commander-pulse" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Analyzing</p>
            </div>
          ) : phase === "debating" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-destructive commander-pulse" />
                <div className="h-1.5 w-1.5 rounded-full bg-warning commander-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="h-1.5 w-1.5 rounded-full bg-info commander-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
              <p className="text-[10px] text-destructive uppercase tracking-widest font-medium">Debate Active</p>
            </div>
          ) : currentCommand ? (
            <p className="text-[10px] text-muted-foreground line-clamp-3">{currentCommand}</p>
          ) : (
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">Awaiting Command</p>
          )}
        </div>
      </div>

      {/* Agent nodes */}
      {positions.map((pos) => (
        <AgentNode
          key={pos.id}
          agentId={pos.id}
          status={agentStates[pos.id].status}
          currentText={agentStates[pos.id].currentText}
          x={pos.x}
          y={pos.y}
        />
      ))}
    </div>
  )
}
