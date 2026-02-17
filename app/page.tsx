"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { fetchLowStock, fetchAllEquipment, fetchPendingOrders, fetchAllInventory, fetchAllOrders } from "@/lib/api"
import { useCrew } from "@/components/crew-provider"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"
import { AgentStatusCard } from "@/components/agent-status-card"
import type { LogEntry, EquipmentItem, InventoryItem, Order } from "@/lib/types"

const AGENTS = [
  { name: "Inventory Manager", role: "Stock tracking & auto-ordering", color: "#22c55e", key: "Inventory Manager" },
  { name: "Pricing Analyst", role: "Dynamic pricing & promotions", color: "#3b82f6", key: "Pricing Analyst" },
  { name: "Maintenance Coordinator", role: "Predictive equipment maintenance", color: "#f59e0b", key: "Maintenance Coordinator" },
  { name: "Customer Service", role: "Loyalty & customer support", color: "#a855f7", key: "Customer Service Representative" },
  { name: "Logistics Coordinator", role: "Route optimization & deliveries", color: "#06b6d4", key: "Logistics Coordinator" },
]

interface AlertItem {
  id: string
  severity: "critical" | "warning" | "info"
  source: string
  title: string
  detail: string
  timestamp: string
}

function getAgentStatus(agentKey: string, logs: LogEntry[], isRunning: boolean): "idle" | "running" | "completed" | "error" {
  const agentLogs = logs.filter((l) => l.agent === agentKey)
  if (agentLogs.length === 0) return "idle"
  if (isRunning) {
    const lastLog = agentLogs[agentLogs.length - 1]
    const isRecent = Date.now() - new Date(lastLog.timestamp).getTime() < 30000
    return isRecent ? "running" : "completed"
  }
  return "completed"
}

function getLastMessage(agentKey: string, logs: LogEntry[]): string | undefined {
  const agentLogs = logs.filter((l) => l.agent === agentKey)
  return agentLogs.length > 0 ? agentLogs[agentLogs.length - 1].message : undefined
}

function buildAlerts(
  lowStock: InventoryItem[] | undefined,
  equipment: EquipmentItem[] | undefined,
  pendingOrders: Order[] | undefined
): AlertItem[] {
  const alerts: AlertItem[] = []
  const now = new Date().toISOString()

  // Equipment critical alerts
  equipment?.forEach((eq) => {
    if (eq.health_score < 0.3) {
      alerts.push({
        id: `eq-crit-${eq.equipment_id}`,
        severity: "critical",
        source: "Maintenance",
        title: `${eq.equipment_name || eq.name || eq.equipment_id} critical failure risk`,
        detail: `Health at ${(eq.health_score * 100).toFixed(0)}% -- immediate attention required.`,
        timestamp: now,
      })
    } else if (eq.health_score < 0.5) {
      alerts.push({
        id: `eq-warn-${eq.equipment_id}`,
        severity: "warning",
        source: "Maintenance",
        title: `${eq.equipment_name || eq.name || eq.equipment_id} health degraded`,
        detail: `Health at ${(eq.health_score * 100).toFixed(0)}% -- schedule maintenance soon.`,
        timestamp: now,
      })
    }
  })

  // Low stock alerts
  lowStock?.forEach((item) => {
    const ratio = item.quantity / Math.max(item.reorder_threshold, 1)
    alerts.push({
      id: `inv-${item.sku}`,
      severity: ratio <= 0.5 ? "critical" : "warning",
      source: "Inventory",
      title: `${item.name} stock low`,
      detail: `${item.quantity} ${item.unit} remaining (reorder at ${item.reorder_threshold}).`,
      timestamp: now,
    })
  })

  // Pending orders info
  if (pendingOrders && pendingOrders.length > 3) {
    alerts.push({
      id: "orders-backlog",
      severity: "info",
      source: "Logistics",
      title: `${pendingOrders.length} orders awaiting fulfillment`,
      detail: "Review the logistics queue for pending deliveries.",
      timestamp: now,
    })
  }

  // Sort by severity
  const order = { critical: 0, warning: 1, info: 2 }
  alerts.sort((a, b) => order[a.severity] - order[b.severity])
  return alerts
}

const SEVERITY_STYLES = {
  critical: { border: "border-danger/40", bg: "bg-danger/5", dot: "bg-danger", text: "text-danger" },
  warning: { border: "border-warning/40", bg: "bg-warning/5", dot: "bg-warning", text: "text-warning" },
  info: { border: "border-info/40", bg: "bg-info/5", dot: "bg-info", text: "text-info" },
}

export default function DashboardPage() {
  const { logs, isRunning, startRun } = useCrew()

  const { data: inventory } = useSWR("all-inventory", fetchAllInventory, { refreshInterval: 30000 })
  const { data: lowStock } = useSWR("low-stock", fetchLowStock, { refreshInterval: 30000 })
  const { data: equipment } = useSWR("all-equipment", fetchAllEquipment, { refreshInterval: 30000 })
  const { data: pendingOrders } = useSWR("pending-orders", fetchPendingOrders, { refreshInterval: 30000 })
  const { data: allOrders } = useSWR("all-orders-dash", () => fetchAllOrders(), { refreshInterval: 30000 })

  const alerts = useMemo(() => buildAlerts(lowStock, equipment, pendingOrders), [lowStock, equipment, pendingOrders])

  const criticalEquipment = equipment?.filter((e) => e.health_score < 0.5) || []
  const totalItems = inventory?.length || 0
  const lowStockCount = lowStock?.length || 0
  const pendingCount = pendingOrders?.length || 0
  const maintenanceCount = criticalEquipment.length
  const deliveredCount = allOrders?.filter((o) => o.order_status === "delivered").length || 0
  const avgHealth = equipment && equipment.length > 0
    ? (equipment.reduce((s, e) => s + e.health_score, 0) / equipment.length * 100).toFixed(0)
    : "--"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Command Center"
        description="Overview of all store operations and agent activity."
        actions={
          !isRunning ? (
            <button
              onClick={() => startRun()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Run Full Crew
            </button>
          ) : (
            <span className="flex items-center gap-2 text-sm text-success">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Crew Running...
            </span>
          )
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KPICard label="Total Products" value={totalItems} variant="neutral" subtitle="Inventory SKUs" />
        <KPICard
          label="Low Stock"
          value={lowStockCount}
          variant={lowStockCount > 0 ? "danger" : "success"}
          subtitle={lowStockCount > 0 ? "Need reorder" : "All stocked"}
        />
        <KPICard
          label="Pending Orders"
          value={pendingCount}
          variant={pendingCount > 0 ? "warning" : "neutral"}
          subtitle="Awaiting fulfillment"
        />
        <KPICard label="Delivered" value={deliveredCount} variant="success" subtitle="Orders completed" />
        <KPICard
          label="Maintenance Due"
          value={maintenanceCount}
          variant={maintenanceCount > 0 ? "danger" : "success"}
          subtitle="Below 50% health"
        />
        <KPICard
          label="Avg Equipment Health"
          value={`${avgHealth}%`}
          variant={Number(avgHealth) < 50 ? "danger" : Number(avgHealth) < 70 ? "warning" : "success"}
          subtitle="Fleet average"
        />
      </div>

      {/* Agent Status Grid */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Agent Status</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {AGENTS.map((agent) => (
            <AgentStatusCard
              key={agent.key}
              name={agent.name}
              role={agent.role}
              color={agent.color}
              status={getAgentStatus(agent.key, logs, isRunning)}
              lastMessage={getLastMessage(agent.key, logs)}
            />
          ))}
        </div>
      </div>

      {/* Alert & Notification Center */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Alert Center ({alerts.length})
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" /> Critical ({alerts.filter(a => a.severity === "critical").length})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Warning ({alerts.filter(a => a.severity === "warning").length})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-info" /> Info ({alerts.filter(a => a.severity === "info").length})</span>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No active alerts. All systems operational.
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto terminal-scroll">
            {alerts.map((alert) => {
              const s = SEVERITY_STYLES[alert.severity]
              return (
                <div key={alert.id} className={`flex items-start gap-3 rounded-lg border ${s.border} ${s.bg} px-4 py-3`}>
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold uppercase ${s.text}`}>{alert.severity}</span>
                      <span className="text-xs text-muted-foreground">{alert.source}</span>
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{alert.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Low Stock Quick View */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Low Stock Items</h3>
          {lowStock && lowStock.length > 0 ? (
            <div className="flex flex-col gap-2">
              {lowStock.slice(0, 5).map((item) => (
                <div key={item.sku} className="flex items-center justify-between rounded-md bg-danger/5 px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{item.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-medium text-danger">{item.quantity}</span>
                    <span className="text-xs text-muted-foreground">/{item.reorder_threshold} {item.unit}</span>
                  </div>
                </div>
              ))}
              {lowStock.length > 5 && (
                <p className="text-xs text-muted-foreground text-center mt-1">+{lowStock.length - 5} more items</p>
              )}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No low stock alerts</p>
          )}
        </div>

        {/* Equipment Health Quick View */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Equipment Health</h3>
          {criticalEquipment.length > 0 ? (
            <div className="flex flex-col gap-2">
              {criticalEquipment.slice(0, 5).map((eq) => (
                <div key={eq.equipment_id} className="flex items-center justify-between rounded-md bg-warning/5 px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-foreground">{eq.equipment_name || eq.name || eq.equipment_id}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{eq.type || ""}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${eq.health_score < 0.3 ? "bg-danger" : "bg-warning"}`}
                        style={{ width: `${eq.health_score * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono font-medium ${eq.health_score < 0.3 ? "text-danger" : "text-warning"}`}>
                      {(eq.health_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">All equipment healthy</p>
          )}
        </div>
      </div>
    </div>
  )
}
