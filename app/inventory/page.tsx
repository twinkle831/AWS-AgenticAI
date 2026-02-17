"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { fetchAllInventory, fetchLowStock, fetchAllOrders } from "@/lib/api"
import { useCrew } from "@/components/crew-provider"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import type { InventoryItem, Order, StatusVariant } from "@/lib/types"

function getStockVariant(item: InventoryItem): StatusVariant {
  if (item.quantity <= 0) return "danger"
  if (item.quantity <= item.reorder_threshold) return "warning"
  if (item.quantity <= item.reorder_threshold * 1.5) return "info"
  return "success"
}

function getStockLabel(item: InventoryItem): string {
  if (item.quantity <= 0) return "Out of Stock"
  if (item.quantity <= item.reorder_threshold) return "Low"
  if (item.quantity <= item.reorder_threshold * 1.5) return "Moderate"
  return "Healthy"
}

/** Simulated demand forecast based on current stock vs threshold ratio */
function getDemandForecast(item: InventoryItem) {
  const ratio = item.quantity / Math.max(item.reorder_threshold, 1)
  const dailyUsage = Math.max(Math.round(item.reorder_threshold * 0.15), 1)
  const daysLeft = Math.round(item.quantity / dailyUsage)
  const trend = ratio < 1 ? "high" : ratio < 2 ? "normal" : "low"
  return { dailyUsage, daysLeft, trend }
}

export default function InventoryPage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "low" | "healthy">("all")
  const [activeTab, setActiveTab] = useState<"stock" | "forecast" | "orders">("stock")

  const { logs } = useCrew()

  const { data: inventory, isLoading: invLoading } = useSWR("all-inventory", fetchAllInventory, { refreshInterval: 15000 })
  const { data: lowStock } = useSWR("low-stock", fetchLowStock, { refreshInterval: 15000 })
  const { data: orders } = useSWR("all-orders", () => fetchAllOrders(), { refreshInterval: 15000 })

  const inventoryLogs = logs.filter((l) => l.agent === "Inventory Manager")
  const lastOutput = inventoryLogs.length > 0 ? inventoryLogs[inventoryLogs.length - 1].message : null

  const filtered = useMemo(() => (inventory || []).filter((item) => {
    const matchesSearch =
      !search ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "low" && item.quantity <= item.reorder_threshold) ||
      (filterStatus === "healthy" && item.quantity > item.reorder_threshold)
    return matchesSearch && matchesFilter
  }), [inventory, search, filterStatus])

  const pendingOrders = orders?.filter((o) => o.order_status === "pending") || []
  const totalUnits = inventory?.reduce((s, i) => s + i.quantity, 0) || 0

  const inventoryColumns = [
    { key: "sku", label: "SKU", className: "font-mono text-xs" as string },
    { key: "name", label: "Product Name" },
    {
      key: "quantity",
      label: "Quantity",
      render: (item: InventoryItem) => (
        <span className={`font-mono font-medium ${item.quantity <= item.reorder_threshold ? "text-danger" : "text-foreground"}`}>
          {item.quantity}
        </span>
      ),
    },
    { key: "unit", label: "Unit" },
    {
      key: "reorder_threshold",
      label: "Reorder At",
      render: (item: InventoryItem) => <span className="font-mono text-muted-foreground">{item.reorder_threshold}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (item: InventoryItem) => <StatusBadge label={getStockLabel(item)} variant={getStockVariant(item)} />,
    },
  ]

  const forecastColumns = [
    { key: "sku", label: "SKU", className: "font-mono text-xs" as string },
    { key: "name", label: "Product" },
    {
      key: "quantity",
      label: "Current Stock",
      render: (item: InventoryItem) => <span className="font-mono">{item.quantity} {item.unit}</span>,
    },
    {
      key: "dailyUsage",
      label: "Est. Daily Usage",
      render: (item: InventoryItem) => {
        const fc = getDemandForecast(item)
        return <span className="font-mono">{fc.dailyUsage} {item.unit}/day</span>
      },
    },
    {
      key: "daysLeft",
      label: "Days Until Empty",
      render: (item: InventoryItem) => {
        const fc = getDemandForecast(item)
        return (
          <span className={`font-mono font-medium ${fc.daysLeft <= 3 ? "text-danger" : fc.daysLeft <= 7 ? "text-warning" : "text-foreground"}`}>
            {fc.daysLeft}d
          </span>
        )
      },
    },
    {
      key: "trend",
      label: "Demand",
      render: (item: InventoryItem) => {
        const fc = getDemandForecast(item)
        return (
          <StatusBadge
            label={fc.trend === "high" ? "High Demand" : fc.trend === "normal" ? "Normal" : "Low Demand"}
            variant={fc.trend === "high" ? "danger" : fc.trend === "normal" ? "info" : "success"}
          />
        )
      },
    },
  ]

  const orderColumns = [
    { key: "order_id", label: "Order ID", className: "font-mono text-xs" as string },
    { key: "sku", label: "SKU", className: "font-mono text-xs" as string },
    {
      key: "quantity",
      label: "Qty",
      render: (o: Order) => <span className="font-mono">{o.quantity}</span>,
    },
    {
      key: "order_status",
      label: "Status",
      render: (o: Order) => (
        <StatusBadge
          label={o.order_status}
          variant={o.order_status === "pending" ? "warning" : o.order_status === "delivered" ? "success" : "info"}
        />
      ),
    },
    {
      key: "actions",
      label: "Action",
      render: (o: Order) =>
        o.order_status === "pending" ? (
          <div className="flex items-center gap-2">
            <button className="rounded bg-success/15 px-2 py-0.5 text-xs font-medium text-success hover:bg-success/25 transition-colors">
              Approve
            </button>
            <button className="rounded bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger hover:bg-danger/25 transition-colors">
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">--</span>
        ),
    },
  ]

  const tabs = [
    { key: "stock" as const, label: "Live Stock Grid" },
    { key: "forecast" as const, label: "Demand Forecast" },
    { key: "orders" as const, label: `Auto-Order Queue (${pendingOrders.length})` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Inventory Manager" description="Track stock levels, forecast demand, and manage auto-generated purchase orders." />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPICard label="Total Products" value={inventory?.length || 0} variant="neutral" subtitle={`${totalUnits} total units`} />
        <KPICard
          label="Low Stock"
          value={lowStock?.length || 0}
          variant={lowStock && lowStock.length > 0 ? "danger" : "success"}
          subtitle="Below reorder threshold"
        />
        <KPICard label="Pending Orders" value={pendingOrders.length} variant={pendingOrders.length > 0 ? "warning" : "neutral"} subtitle="Awaiting approval" />
        <KPICard label="Delivered" value={orders?.filter((o) => o.order_status === "delivered").length || 0} variant="success" subtitle="Orders fulfilled" />
      </div>

      {/* Agent output */}
      {lastOutput && (
        <div className="rounded-lg border border-success/30 bg-success/5 p-4">
          <h3 className="mb-2 text-sm font-medium text-success">Latest Inventory Agent Output</h3>
          <p className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{lastOutput}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "stock" && (
        <div className="flex flex-col gap-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by SKU or name..."
                className="h-9 w-full rounded-md border border-input bg-secondary pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
              {(["all", "low", "healthy"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    filterStatus === f ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "All" : f === "low" ? "Low Stock" : "Healthy"}
                </button>
              ))}
            </div>
          </div>

          {invLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading inventory...</div>
          ) : (
            <DataTable columns={inventoryColumns} data={filtered} rowKey={(item) => item.sku} emptyMessage="No inventory items found" />
          )}
        </div>
      )}

      {activeTab === "forecast" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Estimated demand predictions based on current stock consumption patterns and reorder thresholds.</p>
          {/* Demand summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
              <span className="text-xs font-medium text-muted-foreground uppercase">High Demand SKUs</span>
              <p className="mt-1 text-2xl font-bold text-danger">{(inventory || []).filter(i => getDemandForecast(i).trend === "high").length}</p>
              <span className="text-xs text-muted-foreground">Fast-moving items at risk</span>
            </div>
            <div className="rounded-lg border border-info/30 bg-info/5 p-4">
              <span className="text-xs font-medium text-muted-foreground uppercase">Normal Demand</span>
              <p className="mt-1 text-2xl font-bold text-info">{(inventory || []).filter(i => getDemandForecast(i).trend === "normal").length}</p>
              <span className="text-xs text-muted-foreground">Steady consumption rate</span>
            </div>
            <div className="rounded-lg border border-success/30 bg-success/5 p-4">
              <span className="text-xs font-medium text-muted-foreground uppercase">Low Demand</span>
              <p className="mt-1 text-2xl font-bold text-success">{(inventory || []).filter(i => getDemandForecast(i).trend === "low").length}</p>
              <span className="text-xs text-muted-foreground">Overstocked items</span>
            </div>
          </div>
          <DataTable columns={forecastColumns} data={inventory || []} rowKey={(item) => item.sku} emptyMessage="No forecast data" />
        </div>
      )}

      {activeTab === "orders" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Auto-generated purchase orders from the Inventory Agent. Approve or reject pending orders below.
            </p>
            <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning">
              {pendingOrders.length} pending
            </span>
          </div>
          <DataTable
            columns={orderColumns}
            data={orders || []}
            rowKey={(o) => o.order_id}
            emptyMessage="No orders yet"
          />
        </div>
      )}
    </div>
  )
}
