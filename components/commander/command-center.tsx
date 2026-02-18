"use client"

import { useCommander } from "@/lib/commander/use-commander"
import { AGENTS, type AgentId } from "@/lib/commander/scenarios"
import { VoiceOrb } from "./voice-orb"
import { AgentConstellation } from "./agent-constellation"
import { ConversationTranscript } from "./conversation-transcript"

const SAMPLE_COMMANDS = [
  "What's our inventory situation?",
  "Run a 15% sale on overstock items",
  "Show me the equipment health status",
  "How are customer satisfaction scores?",
  "Prepare for the holiday season",
]

export function CommandCenter() {
  const { state, voice, interrupt, submitTextCommand, startVoiceCommand, stopVoiceCommand, clearHistory } = useCommander()

  return (
    <div className="flex h-full flex-col gap-4 lg:gap-0 lg:flex-row">
      {/* Left panel: Constellation + Voice Orb */}
      <div className="flex flex-col items-center gap-2 lg:w-[400px] lg:shrink-0 lg:border-r lg:border-border lg:pr-4">
        {/* Agent Constellation */}
        <div className="relative">
          <AgentConstellation
            agentStates={state.agentStates}
            activeDebateLinks={state.activeDebateLinks}
            phase={state.phase}
            currentCommand={state.currentCommand}
          />
        </div>

        {/* Voice Orb */}
        <VoiceOrb
          phase={state.phase}
          isListening={voice.isListening}
          interimTranscript={voice.interimTranscript}
          isSupported={voice.isSupported}
          isMuted={voice.isMuted}
          onStartListening={startVoiceCommand}
          onStopListening={stopVoiceCommand}
          onToggleMute={voice.toggleMute}
          onTextSubmit={submitTextCommand}
          onInterrupt={interrupt}
        />

        {/* Quick Commands */}
        <div className="w-full max-w-xs mt-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 text-center">Quick Commands</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {SAMPLE_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                onClick={() => submitTextCommand(cmd)}
                disabled={state.phase !== "idle"}
                className="rounded-md border border-border bg-card/50 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-card hover:border-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Active agents legend */}
        <div className="mt-3 w-full max-w-xs">
          <div className="flex flex-wrap justify-center gap-3">
            {(Object.keys(AGENTS) as AgentId[]).map((id) => {
              const agent = AGENTS[id]
              const agentState = state.agentStates[id]
              const isActive = agentState.status !== "idle"
              return (
                <div key={id} className="flex items-center gap-1.5">
                  <div
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${isActive ? "scale-125" : "opacity-40"}`}
                    style={{
                      backgroundColor: agent.color,
                      boxShadow: isActive ? `0 0 6px ${agent.color}` : "none",
                    }}
                  />
                  <span className={`text-[10px] ${isActive ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {agent.name.split(" ")[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right panel: Conversation Transcript */}
      <div className="flex-1 lg:pl-4 min-h-[400px] lg:min-h-0">
        <ConversationTranscript
          messages={state.messages}
          phase={state.phase}
          speakingAgent={state.speakingAgent}
          onInterrupt={interrupt}
        />
      </div>

      {/* Clear button */}
      {state.messages.length > 0 && state.phase === "idle" && (
        <button
          onClick={clearHistory}
          className="fixed bottom-4 right-4 z-20 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shadow-lg"
        >
          Clear History
        </button>
      )}
    </div>
  )
}
