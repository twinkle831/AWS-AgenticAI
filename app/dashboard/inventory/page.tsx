"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetchAllInventory, fetchLowStock, fetchAllOrders } from "@/lib/api"
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

const FORECAST_DATA = [
  { day: "Mon", current: 340, forecast: 380 },
  { day: "Tue", current: 310, forecast: 360 },
  { day: "Wed", current: 290, forecast: 420 },
  { day: "Thu", current: 0, forecast: 390 },
  { day: "Fri", current: 0, forecast: 450 },
  { day: "Sat", current: 0, forecast: 520 },
  { day: "Sun", current: 0, forecast: 480 },
]

function DemandForecastChart() {
  const maxVal = Math.max(...FORECAST_DATA.map((d) => Math.max(d.current, d.forecast)))
  return (
    <div className="flex items-end gap-3 h-36">
      {FORECAST_DATA.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex items-end gap-0.5 w-full justify-center h-28">
            {d.current > 0 && (
              <div
                className="w-3 rounded-t bg-success/80"
                style={{ height: `${(d.current / maxVal) * 100}%`, minHeight: "4px" }}
              />
            )}
            <div
              className="w-3 rounded-t border border-dashed border-info/60 bg-info/20"
              style={{ height: `${(d.forecast / maxVal) * 100}%`, minHeight: "4px" }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

export default function InventoryPage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "low" | "healthy">("all")

  const { data: inventory, isLoading: invLoading } = useSWR("all-inventory", fetchAllInventory, { refreshInterval: 15000 })
  const { data: lowStock } = useSWR("low-stock", fetchLowStock, { refreshInterval: 15000 })
  const { data: orders } = useSWR("all-orders", () => fetchAllOrders(), { refreshInterval: 15000 })

  const filtered = (inventory || []).filter((item) => {
    const matchesSearch =
      !search ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "low" && item.quantity <= item.reorder_threshold) ||
      (filterStatus === "healthy" && item.quantity > item.reorder_threshold)
    return matchesSearch && matchesFilter
  })

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
          variant={
            o.order_status === "pending" ? "warning" : o.order_status === "delivered" ? "success" : "info"
          }
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Inventory Manager" description="Track stock levels, view low-stock alerts, and manage auto-generated purchase orders." />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Products" value={inventory?.length || 0} variant="neutral" />
        <KPICard
          label="Low Stock"
          value={lowStock?.length || 0}
          variant={lowStock && lowStock.length > 0 ? "danger" : "success"}
        />
        <KPICard label="Pending Orders" value={orders?.filter((o) => o.order_status === "pending").length || 0} variant="warning" />
        <KPICard label="Delivered" value={orders?.filter((o) => o.order_status === "delivered").length || 0} variant="success" />
      </div>

      {/* Demand Forecast Chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 text-sm font-medium text-foreground">Demand Forecast (Next 7 Days)</h2>
        <DemandForecastChart />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
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
                filterStatus === f
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f === "low" ? "Low Stock" : "Healthy"}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Stock Grid {!invLoading && `(${filtered.length})`}
        </h2>
        {invLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading inventory...</div>
        ) : (
          <DataTable columns={inventoryColumns} data={filtered} rowKey={(item) => item.sku} emptyMessage="No inventory items found" />
        )}
      </div>

      {/* Orders Table */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Purchase Orders</h2>
        <DataTable
          columns={orderColumns}
          data={orders || []}
          rowKey={(o) => o.order_id}
          emptyMessage="No orders yet"
        />
      </div>
    </div>
  )
}
