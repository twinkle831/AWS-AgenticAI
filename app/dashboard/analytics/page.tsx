"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetchAllInventory, fetchAllEquipment, fetchAllOrders } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const MOCK_TRENDS = [
  { month: "Jan", revenue: 42000, savings: 3200, orders: 312, maintenance: 8 },
  { month: "Feb", revenue: 45000, savings: 4100, orders: 345, maintenance: 6 },
  { month: "Mar", revenue: 48000, savings: 5800, orders: 389, maintenance: 5 },
  { month: "Apr", revenue: 52000, savings: 7200, orders: 412, maintenance: 4 },
  { month: "May", revenue: 55000, savings: 8900, orders: 456, maintenance: 3 },
  { month: "Jun", revenue: 61000, savings: 10500, orders: 498, maintenance: 2 },
]

const ROI_DATA = [
  {
    agent: "Inventory Manager",
    color: "#22c55e",
    savings: "$12,400",
    description: "Reduced overstock by 34%, eliminated 98% of stockouts via predictive reordering.",
  },
  {
    agent: "Pricing Analyst",
    color: "#3b82f6",
    savings: "$8,700",
    description: "Dynamic pricing increased average margin by 6.2% across seasonal items.",
  },
  {
    agent: "Maintenance Coordinator",
    color: "#f59e0b",
    savings: "$15,200",
    description: "Prevented 3 critical failures, reduced unplanned downtime by 72%.",
  },
  {
    agent: "Customer Service",
    color: "#a855f7",
    savings: "$5,300",
    description: "Automated 68% of tier-1 queries, improved NPS score by 12 points.",
  },
  {
    agent: "Logistics Coordinator",
    color: "#06b6d4",
    savings: "$9,100",
    description: "Optimized routes reduced fuel costs by 18%, improved on-time delivery to 96%.",
  },
]

function BarChart({ data, dataKey, color, maxVal }: { data: typeof MOCK_TRENDS; dataKey: keyof (typeof MOCK_TRENDS)[0]; color: string; maxVal: number }) {
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((item) => {
        const val = item[dataKey] as number
        const height = (val / maxVal) * 100
        return (
          <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-mono text-muted-foreground">{typeof val === "number" && val > 999 ? `${(val / 1000).toFixed(0)}k` : val}</span>
            <div className="w-full rounded-t" style={{ height: `${height}%`, backgroundColor: color, minHeight: "4px" }} />
            <span className="text-xs text-muted-foreground">{item.month}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"6m" | "3m" | "1m">("6m")

  const { data: inventory } = useSWR("all-inventory", fetchAllInventory, { refreshInterval: 30000 })
  const { data: equipment } = useSWR("all-equipment", fetchAllEquipment, { refreshInterval: 30000 })
  const { data: orders } = useSWR("all-orders", () => fetchAllOrders(), { refreshInterval: 30000 })

  const displayData = period === "6m" ? MOCK_TRENDS : period === "3m" ? MOCK_TRENDS.slice(-3) : MOCK_TRENDS.slice(-1)
  const totalSavings = ROI_DATA.reduce((acc, r) => acc + parseInt(r.savings.replace(/[$,]/g, "")), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics & Reporting"
        description="Cross-agent performance analytics, KPI trends, and ROI attribution across all store operations."
        actions={
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
            {(["1m", "3m", "6m"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  period === p ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "1m" ? "1 Month" : p === "3m" ? "3 Months" : "6 Months"}
              </button>
            ))}
          </div>
        }
      />

      {/* Overview KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Revenue (6m)" value="$303K" variant="success" subtitle="+18% vs prior period" />
        <KPICard label="AI Cost Savings" value={`$${(totalSavings / 1000).toFixed(1)}K`} variant="info" subtitle="Across all agents" />
        <KPICard label="Active SKUs" value={inventory?.length || 0} variant="neutral" subtitle="Tracked by agents" />
        <KPICard label="Total Orders" value={orders?.length || 0} variant="neutral" subtitle="Processed this period" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-medium text-foreground">Revenue Trend</h3>
          <BarChart data={displayData} dataKey="revenue" color="#22c55e" maxVal={65000} />
        </div>

        {/* Cost Savings Trend */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-medium text-foreground">AI-Driven Savings</h3>
          <BarChart data={displayData} dataKey="savings" color="#3b82f6" maxVal={12000} />
        </div>

        {/* Order Volume */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-medium text-foreground">Order Volume</h3>
          <BarChart data={displayData} dataKey="orders" color="#06b6d4" maxVal={550} />
        </div>

        {/* Maintenance Events */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-medium text-foreground">Maintenance Events</h3>
          <BarChart data={displayData} dataKey="maintenance" color="#f59e0b" maxVal={10} />
        </div>
      </div>

      {/* ROI Attribution Panel */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">ROI Attribution by Agent</h2>
        <div className="flex flex-col gap-3">
          {ROI_DATA.map((agent) => {
            const val = parseInt(agent.savings.replace(/[$,]/g, ""))
            const pct = (val / totalSavings) * 100
            return (
              <div key={agent.agent} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${agent.color}20` }}>
                      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: agent.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{agent.agent}</p>
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold font-mono" style={{ color: agent.color }}>
                      {agent.savings}
                    </p>
                    <p className="text-xs text-muted-foreground">{pct.toFixed(0)}% of total savings</p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: agent.color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Export Section */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Export Reports</h3>
          <p className="text-xs text-muted-foreground">Download cross-agent analytics as PDF or CSV</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-border bg-secondary px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors">
            Export CSV
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Export PDF
          </button>
        </div>
      </div>
    </div>
  )
}
