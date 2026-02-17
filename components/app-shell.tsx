"use client"

import { Sidebar } from "./sidebar"
import { TerminalPanel } from "./terminal-panel"
import { CrewProvider, useCrew } from "./crew-provider"
import { HealthIndicator } from "./health-indicator"

function ShellInner({ children }: { children: React.ReactNode }) {
  const { logs, isRunning, startRun, clearLogs, stopRun } = useCrew()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col pl-56">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <HealthIndicator />
          </div>
          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={stopRun}
                className="rounded-md bg-danger/20 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/30 transition-colors"
              >
                Stop Crew
              </button>
            ) : (
              <button
                onClick={() => startRun()}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Run Crew
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 pb-84">
          {children}
        </main>
      </div>

      <TerminalPanel
        logs={logs}
        isRunning={isRunning}
        onRun={() => startRun()}
        onClear={clearLogs}
        onStop={stopRun}
      />
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CrewProvider>
      <ShellInner>{children}</ShellInner>
    </CrewProvider>
  )
}
