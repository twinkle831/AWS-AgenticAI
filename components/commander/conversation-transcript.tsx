"use client"

import { useRef, useEffect } from "react"
import { AGENTS, type AgentId, type ConversationMessage } from "@/lib/commander/scenarios"
import type { CommanderPhase } from "@/lib/commander/agent-brain"

interface ConversationTranscriptProps {
  messages: ConversationMessage[]
  phase: CommanderPhase
  speakingAgent: AgentId | null
  onInterrupt: () => void
}

export function ConversationTranscript({
  messages,
  phase,
  speakingAgent,
  onInterrupt,
}: ConversationTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const isActive = phase === "responding" || phase === "debating"

  return (
    <div className="relative flex h-full flex-col rounded-lg border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isActive ? "bg-success commander-pulse" : "bg-muted-foreground/30"}`} />
          <h3 className="text-xs font-medium text-foreground uppercase tracking-wider">Live Transcript</h3>
          <span className="text-[10px] text-muted-foreground">{messages.length} messages</span>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <button
              onClick={onInterrupt}
              className="rounded-md bg-destructive/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-destructive hover:bg-destructive/20 transition-colors border border-destructive/20"
            >
              Interrupt
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 terminal-scroll">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 border border-primary/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <p className="text-xs text-muted-foreground">Speak or type a command to begin</p>
              <p className="mt-1 text-[10px] text-muted-foreground/60">Try: &quot;What&apos;s our inventory situation?&quot;</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isCurrentlySpeaking={speakingAgent === msg.agentId} />
            ))}
            {/* Typing indicator */}
            {speakingAgent && phase !== "idle" && (
              <div className="flex items-center gap-2 px-2 py-1">
                <div
                  className="h-1.5 w-1.5 rounded-full commander-pulse"
                  style={{ backgroundColor: AGENTS[speakingAgent].color }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {AGENTS[speakingAgent].name} is speaking...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 commander-scanline opacity-[0.02]" />
    </div>
  )
}

function MessageBubble({ message, isCurrentlySpeaking }: { message: ConversationMessage; isCurrentlySpeaking: boolean }) {
  if (message.agentId === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-primary/15 border border-primary/20 px-3 py-2">
          <p className="text-xs font-medium text-primary mb-0.5">You</p>
          <p className="text-sm text-foreground leading-relaxed">{message.text}</p>
        </div>
      </div>
    )
  }

  if (message.agentId === "system") {
    return (
      <div className="flex justify-center py-1">
        <p className={`text-[11px] ${message.type === "override" ? "text-destructive font-medium" : "text-muted-foreground italic"}`}>
          {message.text}
        </p>
      </div>
    )
  }

  const agent = AGENTS[message.agentId as AgentId]
  if (!agent) return null

  const isDebate = message.type === "debate"

  return (
    <div className={`flex gap-2.5 ${isCurrentlySpeaking ? "commander-message-glow" : ""}`}>
      {/* Agent color indicator */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <div
          className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold border ${isCurrentlySpeaking ? "commander-pulse" : ""}`}
          style={{
            borderColor: agent.color,
            backgroundColor: agent.color + "20",
            color: agent.color,
            boxShadow: isCurrentlySpeaking ? `0 0 12px ${agent.color}40` : "none",
          }}
        >
          {agent.name.charAt(0)}
        </div>
        {isDebate && (
          <div className="w-px flex-1 bg-destructive/20" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 rounded-lg px-3 py-2 ${isDebate ? "border border-destructive/15 bg-destructive/5" : "bg-secondary/50"}`}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium" style={{ color: agent.color }}>
            {agent.name}
          </span>
          {isDebate && (
            <span className="rounded-sm bg-destructive/10 px-1 py-px text-[9px] font-medium text-destructive uppercase">
              debate
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{message.text}</p>
      </div>
    </div>
  )
}
