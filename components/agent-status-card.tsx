interface AgentStatusCardProps {
  name: string
  role: string
  status: "idle" | "running" | "completed" | "error"
  color: string
  lastMessage?: string
}

const STATUS_CONFIG = {
  idle: { dot: "bg-muted-foreground", label: "Idle", bg: "" },
  running: { dot: "bg-success animate-pulse", label: "Running", bg: "ring-1 ring-success/30" },
  completed: { dot: "bg-primary", label: "Done", bg: "ring-1 ring-primary/30" },
  error: { dot: "bg-danger", label: "Error", bg: "ring-1 ring-danger/30" },
}

export function AgentStatusCard({ name, role, status, color, lastMessage }: AgentStatusCardProps) {
  const cfg = STATUS_CONFIG[status]

  return (
    <div className={`flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-all ${cfg.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: `${color}20` }}>
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          <span className="text-xs text-muted-foreground">{cfg.label}</span>
        </div>
      </div>
      {lastMessage && (
        <p className="truncate text-xs font-mono text-muted-foreground">{lastMessage}</p>
      )}
    </div>
  )
}
