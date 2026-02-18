import { matchScenario, FALLBACK_RESPONSES, AGENTS, type AgentId, type ConversationMessage, type DebateExchange, type Scenario } from "./scenarios"

export type CommanderPhase = "idle" | "listening" | "processing" | "responding" | "debating"

export interface AgentState {
  id: AgentId
  status: "idle" | "thinking" | "speaking" | "disagreeing" | "resolved"
  currentText: string
}

export interface DebateLink {
  from: AgentId
  to: AgentId
  intensity: number // 0-1
  active: boolean
}

export interface CommanderState {
  phase: CommanderPhase
  messages: ConversationMessage[]
  agentStates: Record<AgentId, AgentState>
  activeDebateLinks: DebateLink[]
  speakingAgent: AgentId | null
  currentCommand: string
  isInterrupted: boolean
}

export function createInitialState(): CommanderState {
  const agentStates: Record<string, AgentState> = {} as Record<AgentId, AgentState>
  for (const id of Object.keys(AGENTS) as AgentId[]) {
    agentStates[id] = { id, status: "idle", currentText: "" }
  }
  return {
    phase: "idle",
    messages: [],
    agentStates: agentStates as Record<AgentId, AgentState>,
    activeDebateLinks: [],
    speakingAgent: null,
    currentCommand: "",
    isInterrupted: false,
  }
}

export interface ProcessResult {
  scenario: Scenario | null
  messages: ConversationMessage[]
  debate: DebateExchange[] | null
  involvedAgents: AgentId[]
}

let idCounter = 0
function genId(): string {
  return `msg-${Date.now()}-${idCounter++}`
}

export function processCommand(command: string): ProcessResult {
  const scenario = matchScenario(command)

  if (!scenario) {
    const messages = FALLBACK_RESPONSES.map((m) => ({
      ...m,
      id: genId(),
      timestamp: Date.now(),
    }))
    return {
      scenario: null,
      messages,
      debate: null,
      involvedAgents: ["inventory", "pricing"],
    }
  }

  const messages = scenario.responses.map((m) => ({
    ...m,
    id: genId(),
    timestamp: Date.now(),
  }))

  return {
    scenario,
    messages,
    debate: scenario.hasDebate ? (scenario.debate || null) : null,
    involvedAgents: scenario.involvedAgents,
  }
}

export function getDebateLinks(debate: DebateExchange[]): DebateLink[] {
  const links: DebateLink[] = []
  for (let i = 1; i < debate.length; i++) {
    const prev = debate[i - 1]
    const curr = debate[i]
    if (prev.agentId !== curr.agentId) {
      const intensity = curr.type === "counter" ? 0.9 : curr.type === "argument" ? 0.7 : curr.type === "resolution" ? 0.4 : 0.5
      links.push({
        from: prev.agentId,
        to: curr.agentId,
        intensity,
        active: true,
      })
    }
  }
  return links
}
