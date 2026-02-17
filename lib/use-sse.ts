"use client"

import { useState, useCallback, useRef } from "react"
import type { LogEntry, CrewResult, AgentRole } from "./types"
import { getStreamCrewUrl } from "./api"

let logCounter = 0

export function useSSE() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<CrewResult | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const startRun = useCallback((storeId = "store-001") => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setIsRunning(true)
    setResult(null)

    const url = getStreamCrewUrl(storeId)
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "log" || data.type === "start") {
          const entry: LogEntry = {
            id: `log-${++logCounter}`,
            type: data.type,
            agent: (data.agent as AgentRole) || "System",
            message: data.message,
            timestamp: data.timestamp || new Date().toISOString(),
          }
          setLogs((prev) => [...prev, entry])
        }
        // heartbeats are silently ignored
      } catch {
        // If it's not JSON, treat as plain text log
        const entry: LogEntry = {
          id: `log-${++logCounter}`,
          type: "log",
          agent: "System",
          message: event.data,
          timestamp: new Date().toISOString(),
        }
        setLogs((prev) => [...prev, entry])
      }
    }

    es.addEventListener("result", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data)
        setResult(data)
      } catch {
        // ignore
      }
    })

    es.addEventListener("done", () => {
      setIsRunning(false)
      es.close()
      eventSourceRef.current = null
    })

    es.onerror = () => {
      setIsRunning(false)
      es.close()
      eventSourceRef.current = null
    }
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
    setResult(null)
  }, [])

  const stopRun = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsRunning(false)
  }, [])

  return { logs, isRunning, result, startRun, clearLogs, stopRun }
}
