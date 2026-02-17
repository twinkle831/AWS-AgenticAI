"use client"

import useSWR from "swr"
import { fetchAllEquipment } from "@/lib/api"
import { useCrew } from "@/components/crew-provider"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"
import type { EquipmentItem } from "@/lib/types"

function healthColor(score: number): string {
  if (score < 0.3) return "bg-danger"
  if (score < 0.5) return "bg-warning"
  return "bg-success"
}

function healthTextColor(score: number): string {
  if (score < 0.3) return "text-danger"
  if (score < 0.5) return "text-warning"
  return "text-success"
}

function priorityLabel(score: number): string {
  if (score < 0.3) return "Critical"
  if (score < 0.5) return "Urgent"
  if (score < 0.7) return "Monitor"
  return "Good"
}

export default function MaintenancePage() {
  const { logs } = useCrew()

  const { data: equipment, isLoading } = useSWR("all-equipment", fetchAllEquipment, { refreshInterval: 15000 })

  // Sort by health score ascending (worst first)
  const sorted = [...(equipment || [])].sort((a, b) => a.health_score - b.health_score)

  const critical = sorted.filter((e) => e.health_score < 0.3)
  const urgent = sorted.filter((e) => e.health_score >= 0.3 && e.health_score < 0.5)
  const healthy = sorted.filter((e) => e.health_score >= 0.5)

  const maintenanceLogs = logs.filter((l) => l.agent === "Maintenance Coordinator")
  const lastOutput = maintenanceLogs.length > 0 ? maintenanceLogs[maintenanceLogs.length - 1].message : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Maintenance Coordinator"
        description="Monitor equipment health scores and prioritize preventive maintenance schedules."
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Equipment" value={equipment?.length || 0} variant="neutral" />
        <KPICard label="Critical" value={critical.length} variant={critical.length > 0 ? "danger" : "success"} subtitle="Below 30% health" />
        <KPICard label="Urgent" value={urgent.length} variant={urgent.length > 0 ? "warning" : "success"} subtitle="30-50% health" />
        <KPICard label="Healthy" value={healthy.length} variant="success" subtitle="Above 50% health" />
      </div>

      {/* Agent output */}
      {lastOutput && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <h3 className="mb-2 text-sm font-medium text-warning">Latest Maintenance Agent Output</h3>
          <p className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{lastOutput}</p>
        </div>
      )}

      {/* Equipment Health List */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Equipment Health {!isLoading && `(${sorted.length})`}
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading equipment data...</div>
        ) : sorted.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">No equipment found</div>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((eq) => (
              <EquipmentRow key={eq.equipment_id} equipment={eq} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EquipmentRow({ equipment: eq }: { equipment: EquipmentItem }) {
  const pct = Math.round(eq.health_score * 100)

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
      {/* Priority indicator */}
      <div className={`h-8 w-1 rounded-full ${healthColor(eq.health_score)}`} />

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{eq.equipment_name || eq.name || eq.equipment_id}</span>
          {eq.type && <span className="text-xs text-muted-foreground">({eq.type})</span>}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-mono">{eq.equipment_id}</span>
          {eq.last_maintenance && <span>Last maintained: {eq.last_maintenance}</span>}
          {eq.location && <span>Location: {eq.location}</span>}
        </div>
      </div>

      {/* Priority label */}
      <span className={`text-xs font-medium ${healthTextColor(eq.health_score)}`}>{priorityLabel(eq.health_score)}</span>

      {/* Health bar */}
      <div className="flex items-center gap-2 w-40">
        <div className="flex-1 h-2 overflow-hidden rounded-full bg-secondary">
          <div className={`h-full rounded-full transition-all ${healthColor(eq.health_score)}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-xs font-mono font-medium w-8 text-right ${healthTextColor(eq.health_score)}`}>{pct}%</span>
      </div>
    </div>
  )
}
