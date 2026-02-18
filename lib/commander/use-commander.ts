"use client"

import { useState, useCallback, useRef } from "react"
import {
  createInitialState,
  processCommand,
  getDebateLinks,
  type CommanderState,
  type CommanderPhase,
} from "./agent-brain"
import { AGENTS, type AgentId, type ConversationMessage } from "./scenarios"
import { useVoice } from "./use-voice"

export function useCommander() {
  const [state, setState] = useState<CommanderState>(createInitialState)
  const voice = useVoice()
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const isProcessingRef = useRef(false)
  const isInterruptedRef = useRef(false)

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  const setPhase = useCallback((phase: CommanderPhase) => {
    setState((s) => ({ ...s, phase }))
  }, [])

  const addMessage = useCallback((msg: ConversationMessage) => {
    setState((s) => ({ ...s, messages: [...s.messages, msg] }))
  }, [])

  const setAgentStatus = useCallback((agentId: AgentId, status: "idle" | "thinking" | "speaking" | "disagreeing" | "resolved", currentText: string = "") => {
    setState((s) => ({
      ...s,
      agentStates: {
        ...s.agentStates,
        [agentId]: { ...s.agentStates[agentId], status, currentText },
      },
    }))
  }, [])

  const resetAgents = useCallback(() => {
    setState((s) => {
      const agentStates = { ...s.agentStates }
      for (const id of Object.keys(AGENTS) as AgentId[]) {
        agentStates[id] = { id, status: "idle", currentText: "" }
      }
      return { ...s, agentStates, activeDebateLinks: [], speakingAgent: null }
    })
  }, [])

  const sleep = useCallback((ms: number) => {
    return new Promise<void>((resolve) => {
      const t = setTimeout(resolve, ms)
      timeoutsRef.current.push(t)
    })
  }, [])

  const handleCommand = useCallback(async (command: string) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    isInterruptedRef.current = false
    clearTimeouts()
    resetAgents()

    // Add user message
    const userMsg: ConversationMessage = {
      id: `user-${Date.now()}`,
      agentId: "user",
      text: command,
      type: "user",
      timestamp: Date.now(),
    }
    addMessage(userMsg)
    setState((s) => ({ ...s, currentCommand: command, phase: "processing", isInterrupted: false }))

    const result = processCommand(command)

    // Set involved agents to "thinking"
    for (const agentId of result.involvedAgents) {
      setAgentStatus(agentId, "thinking")
    }

    await sleep(1500)
    if (isInterruptedRef.current) return

    setPhase("responding")

    // Deliver responses one at a time
    for (let i = 0; i < result.messages.length; i++) {
      if (isInterruptedRef.current) return

      const msg = result.messages[i]
      if (msg.agentId !== "system" && msg.agentId !== "user") {
        setState((s) => ({ ...s, speakingAgent: msg.agentId as AgentId }))
        setAgentStatus(msg.agentId as AgentId, "speaking", msg.text)
        voice.speak(msg.text, msg.agentId as AgentId)
      }

      addMessage({ ...msg, timestamp: Date.now() })

      const delay = Math.min(msg.text.length * 25, 4000) + 800
      await sleep(delay)
      if (isInterruptedRef.current) return

      if (msg.agentId !== "system" && msg.agentId !== "user") {
        setAgentStatus(msg.agentId as AgentId, "idle")
      }
    }

    // Handle debate
    if (result.debate && !isInterruptedRef.current) {
      setPhase("debating")
      const links = getDebateLinks(result.debate)
      setState((s) => ({ ...s, activeDebateLinks: links }))

      for (let i = 0; i < result.debate.length; i++) {
        if (isInterruptedRef.current) return

        const exchange = result.debate[i]
        const isConflict = exchange.type === "counter" || exchange.type === "argument"

        setAgentStatus(exchange.agentId, isConflict ? "disagreeing" : "speaking", exchange.text)
        setState((s) => ({ ...s, speakingAgent: exchange.agentId }))

        const debateMsg: ConversationMessage = {
          id: `debate-${Date.now()}-${i}`,
          agentId: exchange.agentId,
          text: exchange.text,
          type: "debate",
          timestamp: Date.now(),
        }
        addMessage(debateMsg)
        voice.speak(exchange.text, exchange.agentId)

        const delay = Math.min(exchange.text.length * 25, 5000) + 1200
        await sleep(delay)
        if (isInterruptedRef.current) return

        if (exchange.type !== "resolution") {
          setAgentStatus(exchange.agentId, "idle")
        } else {
          setAgentStatus(exchange.agentId, "resolved", exchange.text)
        }
      }

      await sleep(1000)
      if (isInterruptedRef.current) return
      setState((s) => ({ ...s, activeDebateLinks: s.activeDebateLinks.map((l) => ({ ...l, active: false })) }))
    }

    // Return to idle
    resetAgents()
    setPhase("idle")
    setState((s) => ({ ...s, speakingAgent: null, currentCommand: "" }))
    isProcessingRef.current = false
  }, [addMessage, clearTimeouts, resetAgents, setAgentStatus, setPhase, sleep, voice])

  const interrupt = useCallback(() => {
    isInterruptedRef.current = true
    clearTimeouts()
    voice.cancelSpeech()
    resetAgents()
    setPhase("idle")
    isProcessingRef.current = false
    setState((s) => ({ ...s, isInterrupted: true }))

    const interruptMsg: ConversationMessage = {
      id: `interrupt-${Date.now()}`,
      agentId: "system",
      text: "Manager override -- conversation interrupted. Standing by for new command.",
      type: "override",
      timestamp: Date.now(),
    }
    addMessage(interruptMsg)
  }, [addMessage, clearTimeouts, resetAgents, setPhase, voice])

  const submitTextCommand = useCallback((text: string) => {
    if (text.trim()) {
      handleCommand(text.trim())
    }
  }, [handleCommand])

  const startVoiceCommand = useCallback(() => {
    voice.startListening()
  }, [voice])

  const stopVoiceCommand = useCallback(() => {
    voice.stopListening((transcript: string) => {
      if (transcript.trim()) {
        handleCommand(transcript.trim())
      }
    })
  }, [voice, handleCommand])

  const clearHistory = useCallback(() => {
    isInterruptedRef.current = true
    clearTimeouts()
    voice.cancelSpeech()
    isProcessingRef.current = false
    setState(createInitialState())
  }, [clearTimeouts, voice])

  return {
    state,
    voice,
    handleCommand,
    interrupt,
    submitTextCommand,
    startVoiceCommand,
    stopVoiceCommand,
    clearHistory,
  }
}
