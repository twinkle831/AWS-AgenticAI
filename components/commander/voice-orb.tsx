"use client"

import { useRef, useEffect, useCallback } from "react"
import type { CommanderPhase } from "@/lib/commander/agent-brain"

interface VoiceOrbProps {
  phase: CommanderPhase
  isListening: boolean
  interimTranscript: string
  isSupported: boolean
  isMuted: boolean
  onStartListening: () => void
  onStopListening: () => void
  onToggleMute: () => void
  onTextSubmit: (text: string) => void
  onInterrupt: () => void
}

export function VoiceOrb({
  phase,
  isListening,
  interimTranscript,
  isSupported,
  isMuted,
  onStartListening,
  onStopListening,
  onToggleMute,
  onTextSubmit,
  onInterrupt,
}: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Canvas waveform animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 200 * dpr
    canvas.height = 200 * dpr
    ctx.scale(dpr, dpr)

    let frame = 0
    const draw = () => {
      frame++
      ctx.clearRect(0, 0, 200, 200)
      const cx = 100
      const cy = 100

      if (isListening || phase === "responding" || phase === "debating") {
        // Animated waveform rings
        const numRings = isListening ? 4 : 3
        for (let r = 0; r < numRings; r++) {
          const progress = ((frame * 0.02 + r * 0.25) % 1)
          const radius = 30 + progress * 50
          const alpha = (1 - progress) * (isListening ? 0.6 : 0.3)
          ctx.beginPath()
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.strokeStyle = isListening
            ? `rgba(109, 92, 255, ${alpha})`
            : phase === "debating"
              ? `rgba(239, 68, 68, ${alpha})`
              : `rgba(109, 92, 255, ${alpha * 0.7})`
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Waveform bars around the orb
        const numBars = 32
        for (let i = 0; i < numBars; i++) {
          const angle = (i / numBars) * Math.PI * 2
          const noise = Math.sin(frame * 0.05 + i * 0.5) * 0.5 + 0.5
          const barLength = isListening ? 8 + noise * 20 : 4 + noise * 10
          const innerR = 35
          const outerR = innerR + barLength

          const x1 = cx + Math.cos(angle) * innerR
          const y1 = cy + Math.sin(angle) * innerR
          const x2 = cx + Math.cos(angle) * outerR
          const y2 = cy + Math.sin(angle) * outerR

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = isListening
            ? `rgba(109, 92, 255, ${0.4 + noise * 0.6})`
            : `rgba(109, 92, 255, ${0.2 + noise * 0.3})`
          ctx.lineWidth = 2.5
          ctx.lineCap = "round"
          ctx.stroke()
        }
      } else if (phase === "processing") {
        // Spinning loader
        const segments = 12
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2 - frame * 0.08
          const alpha = (i / segments)
          const x1 = cx + Math.cos(angle) * 30
          const y1 = cy + Math.sin(angle) * 30
          const x2 = cx + Math.cos(angle) * 42
          const y2 = cy + Math.sin(angle) * 42
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = `rgba(109, 92, 255, ${alpha})`
          ctx.lineWidth = 3
          ctx.lineCap = "round"
          ctx.stroke()
        }
      } else {
        // Idle pulse
        const pulse = Math.sin(frame * 0.03) * 0.15 + 0.85
        ctx.beginPath()
        ctx.arc(cx, cy, 32 * pulse, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(109, 92, 255, 0.3)`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationRef.current)
  }, [isListening, phase])

  const handleOrbClick = useCallback(() => {
    if (phase === "responding" || phase === "debating") {
      onInterrupt()
      return
    }
    if (isListening) {
      onStopListening()
    } else {
      onStartListening()
    }
  }, [isListening, phase, onStartListening, onStopListening, onInterrupt])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputRef.current?.value.trim()) {
      onTextSubmit(inputRef.current.value.trim())
      inputRef.current.value = ""
    }
  }, [onTextSubmit])

  const phaseLabel = phase === "idle"
    ? isListening ? "Listening..." : "Click to speak"
    : phase === "processing"
      ? "Processing..."
      : phase === "responding"
        ? "Agents responding..."
        : phase === "debating"
          ? "Agents debating..."
          : "Ready"

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Orb */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="absolute inset-0"
          style={{ width: 200, height: 200 }}
        />
        <button
          onClick={handleOrbClick}
          disabled={phase === "processing"}
          className="relative z-10 flex h-[200px] w-[200px] items-center justify-center"
          aria-label={phaseLabel}
        >
          <div className={`
            flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300
            ${isListening
              ? "bg-primary/30 shadow-[0_0_30px_rgba(109,92,255,0.5)]"
              : phase === "debating"
                ? "bg-destructive/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                : phase === "processing"
                  ? "bg-primary/20 animate-pulse"
                  : "bg-card hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(109,92,255,0.3)]"
            }
            border border-border
          `}>
            {(phase === "responding" || phase === "debating") ? (
              // Interrupt icon (hand/stop)
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
            ) : (
              // Microphone icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isListening ? "text-primary" : "text-muted-foreground"}>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Phase label */}
      <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
        {phaseLabel}
      </p>

      {/* Interim transcript */}
      {isListening && interimTranscript && (
        <p className="max-w-[280px] text-center text-sm text-primary/80 italic animate-pulse">
          {'"'}{interimTranscript}{'"'}
        </p>
      )}

      {/* Text input fallback + mute button */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <input
          ref={inputRef}
          type="text"
          placeholder={isSupported ? "Or type a command..." : "Type your command..."}
          onKeyDown={handleKeyDown}
          disabled={phase === "processing" || phase === "responding" || phase === "debating"}
          className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        <button
          onClick={onToggleMute}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border transition-colors ${isMuted ? "bg-destructive/10 text-destructive" : "bg-card text-muted-foreground hover:text-foreground"}`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
