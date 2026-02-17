"use client"

import useSWR from "swr"
import { fetchLowStock, fetchAllEquipment, fetchPendingOrders, fetchAllInventory } from "@/lib/api"
import { useCrew } from "@/components/crew-provider"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"
import { AgentStatusCard } from "@/components/agent-status-card"
import type { LogEntry } from "@/lib/types"

const AGENTS = [
  { name: "Inventory Manager", role: "Stock tracking & auto-ordering", color: "#22c55e", key: "Inventory Manager" },
  { name: "Pricing Analyst", role: "Dynamic pricing & promotions", color: "#3b82f6", key: "Pricing Analyst" },
  { name: "Maintenance Coordinator", role: "Predictive equipment maintenance", color: "#f59e0b", key: "Maintenance Coordinator" },
  { name: "Customer Service", role: "Loyalty & customer support", color: "#a855f7", key: "Customer Service Representative" },
  { name: "Logistics Coordinator", role: "Route optimization & deliveries", color: "#06b6d4", key: "Logistics Coordinator" },
]

function getAgentStatus(agentKey: string, logs: LogEntry[], isRunning: boolean): "idle" | "running" | "completed" | "error" {
  const agentLogs = logs.filter((l) => l.agent === agentKey)
  if (agentLogs.length === 0) return isRunning ? "idle" : "idle"
  if (isRunning) {
    // If we're getting logs for this agent, it's running
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

export default function DashboardPage() {
  const { logs, isRunning, startRun } = useCrew()

  const { data: inventory } = useSWR("all-inventory", fetchAllInventory, { refreshInterval: 30000 })
  const { data: lowStock } = useSWR("low-stock", fetchLowStock, { refreshInterval: 30000 })
  const { data: equipment } = useSWR("all-equipment", fetchAllEquipment, { refreshInterval: 30000 })
  const { data: pendingOrders } = useSWR("pending-orders", fetchPendingOrders, { refreshInterval: 30000 })

  const criticalEquipment = equipment?.filter((e) => e.health_score < 0.5) || []
  const totalItems = inventory?.length || 0
  const lowStockCount = lowStock?.length || 0
  const pendingCount = pendingOrders?.length || 0
  const maintenanceCount = criticalEquipment.length

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
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Products" value={totalItems} variant="neutral" subtitle="Inventory items tracked" />
        <KPICard
          label="Low Stock Alerts"
          value={lowStockCount}
          variant={lowStockCount > 0 ? "danger" : "success"}
          subtitle={lowStockCount > 0 ? "Items need reordering" : "All stock healthy"}
        />
        <KPICard
          label="Pending Orders"
          value={pendingCount}
          variant={pendingCount > 0 ? "warning" : "neutral"}
          subtitle="Awaiting fulfillment"
        />
        <KPICard
          label="Maintenance Due"
          value={maintenanceCount}
          variant={maintenanceCount > 0 ? "danger" : "success"}
          subtitle={maintenanceCount > 0 ? "Equipment below 50% health" : "All equipment healthy"}
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

      {/* Alerts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Low Stock Alerts</h3>
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
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No low stock alerts</p>
          )}
        </div>

        {/* Equipment Alerts */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Equipment Health Alerts</h3>
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
