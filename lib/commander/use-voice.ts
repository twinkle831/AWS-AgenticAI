"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { AGENTS, type AgentId } from "./scenarios"

interface VoiceState {
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  interimTranscript: string
  isSupported: boolean
  isMuted: boolean
  speakingAgentId: AgentId | null
}

export function useVoice() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: "",
    interimTranscript: "",
    isSupported: false,
    isMuted: false,
    speakingAgentId: null,
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const speechQueueRef = useRef<{ text: string; agentId: AgentId }[]>([])
  const isSpeakingRef = useRef(false)
  const isMutedRef = useRef(false)
  const transcriptRef = useRef("")
  const interimRef = useRef("")
  const onFinalTranscriptRef = useRef<((text: string) => void) | null>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const supported = !!SpeechRecognition && !!window.speechSynthesis
    setState((s) => ({ ...s, isSupported: supported }))
    if (supported) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ""
      let final = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }
      if (final) {
        transcriptRef.current = final
      }
      interimRef.current = interim
      setState((s) => ({
        ...s,
        transcript: final || s.transcript,
        interimTranscript: interim,
      }))
    }

    recognition.onend = () => {
      setState((s) => ({ ...s, isListening: false }))
      // When recognition ends, fire the callback with whatever we got
      const finalText = transcriptRef.current || interimRef.current
      if (finalText.trim() && onFinalTranscriptRef.current) {
        onFinalTranscriptRef.current(finalText.trim())
        onFinalTranscriptRef.current = null
      }
    }

    recognition.onerror = () => {
      setState((s) => ({ ...s, isListening: false }))
    }

    recognitionRef.current = recognition
    recognition.start()
    transcriptRef.current = ""
    interimRef.current = ""
    setState((s) => ({ ...s, isListening: true, transcript: "", interimTranscript: "" }))
  }, [])

  const stopListening = useCallback((onComplete?: (transcript: string) => void) => {
    if (onComplete) {
      onFinalTranscriptRef.current = onComplete
    }
    recognitionRef.current?.stop()
    setState((s) => ({ ...s, isListening: false }))
  }, [])

  const processQueue = useCallback(() => {
    if (isSpeakingRef.current || speechQueueRef.current.length === 0) return

    const item = speechQueueRef.current.shift()
    if (!item) return

    isSpeakingRef.current = true
    setState((s) => ({ ...s, speakingAgentId: item.agentId, isSpeaking: true }))

    if (isMutedRef.current || !synthRef.current) {
      // Muted: simulate speech timing
      const duration = Math.min(item.text.length * 30, 4000)
      setTimeout(() => {
        isSpeakingRef.current = false
        if (speechQueueRef.current.length > 0) {
          processQueue()
        } else {
          setState((s) => ({ ...s, isSpeaking: false, speakingAgentId: null }))
        }
      }, duration)
      return
    }

    const agent = AGENTS[item.agentId]
    const utterance = new SpeechSynthesisUtterance(item.text)
    utterance.pitch = agent.voicePitch
    utterance.rate = agent.voiceRate
    utterance.volume = 0.8

    const voices = synthRef.current.getVoices()
    if (voices.length > 0) {
      const agentIndex = Object.keys(AGENTS).indexOf(item.agentId)
      const voiceIndex = agentIndex % voices.length
      utterance.voice = voices[voiceIndex]
    }

    const onFinish = () => {
      isSpeakingRef.current = false
      if (speechQueueRef.current.length > 0) {
        processQueue()
      } else {
        setState((s) => ({ ...s, isSpeaking: false, speakingAgentId: null }))
      }
    }

    utterance.onend = onFinish
    utterance.onerror = onFinish

    synthRef.current.speak(utterance)
  }, [])

  const speak = useCallback((text: string, agentId: AgentId) => {
    speechQueueRef.current.push({ text, agentId })
    if (!isSpeakingRef.current) {
      processQueue()
    }
  }, [processQueue])

  const cancelSpeech = useCallback(() => {
    synthRef.current?.cancel()
    speechQueueRef.current = []
    isSpeakingRef.current = false
    setState((s) => ({ ...s, isSpeaking: false, speakingAgentId: null }))
  }, [])

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current
    setState((s) => ({ ...s, isMuted: isMutedRef.current }))
    // If muting while speaking, cancel current speech
    if (isMutedRef.current) {
      synthRef.current?.cancel()
    }
  }, [])

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    toggleMute,
  }
}
