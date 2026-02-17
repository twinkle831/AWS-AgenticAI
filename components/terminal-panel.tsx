"use client"

import { useEffect, useRef, useState } from "react"
import type { LogEntry } from "@/lib/types"

const AGENT_COLORS: Record<string, string> = {
  "Inventory Manager": "agent-inventory",
  "Pricing Analyst": "agent-pricing",
  "Maintenance Coordinator": "agent-maintenance",
  "Customer Service Representative": "agent-customer",
  "Logistics Coordinator": "agent-logistics",
  System: "agent-system",
}

interface TerminalPanelProps {
  logs: LogEntry[]
  isRunning: boolean
  onRun: () => void
  onClear: () => void
  onStop: () => void
}

export function TerminalPanel({ logs, isRunning, onRun, onClear, onStop }: TerminalPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  // Auto-expand when crew starts running
  useEffect(() => {
    if (isRunning) setIsExpanded(true)
  }, [isRunning])

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } catch {
      return "--:--:--"
    }
  }

  return (
    <div
      className={`fixed bottom-0 left-56 right-0 z-40 flex flex-col border-t border-border bg-terminal transition-all duration-300 ${
        isExpanded ? "h-80" : "h-10"
      }`}
    >
      {/* Header bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-medium text-terminal-foreground hover:text-foreground transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${isExpanded ? "" : "rotate-180"}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span className="font-mono">Terminal</span>
          {isRunning && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-success">Running</span>
            </span>
          )}
          {!isRunning && logs.length > 0 && (
            <span className="text-muted-foreground">
              {logs.length} lines
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`rounded px-2 py-0.5 text-xs font-mono transition-colors ${
              autoScroll
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}
          >
            scroll
          </button>
          <button
            onClick={onClear}
            className="rounded px-2 py-0.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            clear
          </button>
          {isRunning ? (
            <button
              onClick={onStop}
              className="rounded bg-danger/20 px-3 py-0.5 text-xs font-mono font-medium text-danger hover:bg-danger/30 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={onRun}
              className="rounded bg-primary/20 px-3 py-0.5 text-xs font-mono font-medium text-primary hover:bg-primary/30 transition-colors"
            >
              Run Crew
            </button>
          )}
        </div>
      </div>

      {/* Log output */}
      {isExpanded && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 terminal-scroll">
          {logs.length === 0 && (
            <p className="py-4 text-center text-xs font-mono text-muted-foreground">
              No logs yet. Click &quot;Run Crew&quot; to start the agentic pipeline.
            </p>
          )}
          {logs.map((entry) => (
            <div key={entry.id} className="flex gap-3 py-0.5 text-xs font-mono leading-5">
              <span className="shrink-0 text-muted-foreground">{formatTime(entry.timestamp)}</span>
              <span className={`shrink-0 w-32 truncate font-semibold ${AGENT_COLORS[entry.agent] || "agent-system"}`}>
                [{entry.agent}]
              </span>
              <span className="text-terminal-foreground break-all">{entry.message}</span>
            </div>
          ))}
          {isRunning && (
            <div className="flex items-center gap-2 py-1 text-xs font-mono text-muted-foreground">
              <span className="animate-pulse">{'>'}_</span>
              <span>Waiting for agent output...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
