"use client"

import type { AgentId } from "@/lib/commander/scenarios"
import { AGENTS } from "@/lib/commander/scenarios"

interface AgentNodeProps {
  agentId: AgentId
  status: "idle" | "thinking" | "speaking" | "disagreeing" | "resolved"
  currentText: string
  x: number
  y: number
}

export function AgentNode({ agentId, status, currentText, x, y }: AgentNodeProps) {
  const agent = AGENTS[agentId]

  const glowColor = status === "disagreeing"
    ? "rgba(239, 68, 68, 0.6)"
    : status === "speaking"
      ? `${agent.color}`
      : status === "thinking"
        ? `${agent.color}80`
        : status === "resolved"
          ? `${agent.color}60`
          : "transparent"

  const shadowSize = status === "speaking" ? 25 : status === "disagreeing" ? 20 : status === "thinking" ? 15 : 0

  return (
    <div
      className="absolute flex flex-col items-center gap-1.5"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Node circle */}
      <div className="relative">
        {/* Outer glow ring */}
        {status !== "idle" && (
          <div
            className={`absolute inset-[-8px] rounded-full ${status === "thinking" ? "commander-spin" : status === "speaking" ? "commander-pulse" : ""}`}
            style={{
              background: `radial-gradient(circle, ${glowColor}30 0%, transparent 70%)`,
              boxShadow: `0 0 ${shadowSize}px ${glowColor}`,
            }}
          />
        )}

        {/* Inner circle */}
        <div
          className={`
            relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300
            ${status === "idle" ? "opacity-50" : "opacity-100"}
          `}
          style={{
            borderColor: status === "disagreeing" ? "#ef4444" : agent.color,
            background: `${status === "idle" ? agent.color + "10" : agent.color + "25"}`,
            boxShadow: shadowSize > 0 ? `0 0 ${shadowSize}px ${glowColor}, inset 0 0 8px ${agent.color}20` : "none",
          }}
        >
          {/* Agent icon / initial */}
          <span
            className="text-sm font-bold"
            style={{ color: agent.color }}
          >
            {agent.name.charAt(0)}
          </span>

          {/* Speaking ripple effect */}
          {status === "speaking" && (
            <>
              <div className="absolute inset-0 rounded-full commander-ripple" style={{ borderColor: agent.color }} />
              <div className="absolute inset-0 rounded-full commander-ripple-delayed" style={{ borderColor: agent.color }} />
            </>
          )}
        </div>
      </div>

      {/* Agent name */}
      <span
        className={`text-[10px] font-medium tracking-wide whitespace-nowrap transition-colors duration-300 ${
          status === "idle" ? "text-muted-foreground" : ""
        }`}
        style={{ color: status !== "idle" ? agent.color : undefined }}
      >
        {agent.name.split(" ")[0]}
      </span>

      {/* Status indicator */}
      {status !== "idle" && (
        <span className={`text-[9px] uppercase tracking-wider font-medium ${
          status === "disagreeing" ? "text-destructive" : "text-muted-foreground"
        }`}>
          {status === "thinking" ? "analyzing" : status === "speaking" ? "speaking" : status === "disagreeing" ? "objecting" : "resolved"}
        </span>
      )}

      {/* Current text preview (truncated) */}
      {currentText && status === "speaking" && (
        <div
          className="absolute top-full mt-6 w-40 rounded-md border border-border bg-card/90 px-2 py-1.5 backdrop-blur-sm"
          style={{ borderColor: agent.color + "40" }}
        >
          <p className="text-[10px] leading-tight text-foreground line-clamp-2">
            {currentText.substring(0, 80)}{currentText.length > 80 ? "..." : ""}
          </p>
        </div>
      )}
    </div>
  )
}
