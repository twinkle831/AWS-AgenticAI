"use client"

import { createContext, useContext } from "react"
import { useSSE } from "@/lib/use-sse"
import type { LogEntry, CrewResult } from "@/lib/types"

interface CrewContextType {
  logs: LogEntry[]
  isRunning: boolean
  result: CrewResult | null
  startRun: (storeId?: string) => void
  clearLogs: () => void
  stopRun: () => void
}

const CrewContext = createContext<CrewContextType | null>(null)

export function CrewProvider({ children }: { children: React.ReactNode }) {
  const sse = useSSE()
  return <CrewContext.Provider value={sse}>{children}</CrewContext.Provider>
}

export function useCrew() {
  const ctx = useContext(CrewContext)
  if (!ctx) throw new Error("useCrew must be used within CrewProvider")
  return ctx
}
