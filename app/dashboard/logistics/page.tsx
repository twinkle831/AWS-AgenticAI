"use client"

import useSWR from "swr"
import { fetchPendingOrders, fetchAllOrders } from "@/lib/api"
import { useCrew } from "@/components/crew-provider"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import type { Order, StatusVariant } from "@/lib/types"

function orderStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "pending":
      return "warning"
    case "in_transit":
    case "shipped":
      return "info"
    case "delivered":
      return "success"
    case "cancelled":
      return "danger"
    default:
      return "neutral"
  }
}

export default function LogisticsPage() {
  const { logs } = useCrew()

  const { data: pendingOrders, isLoading: pendingLoading } = useSWR("pending-orders", fetchPendingOrders, { refreshInterval: 15000 })
  const { data: allOrders } = useSWR("all-orders", () => fetchAllOrders(), { refreshInterval: 15000 })

  const logisticsLogs = logs.filter((l) => l.agent === "Logistics Coordinator")
  const lastOutput = logisticsLogs.length > 0 ? logisticsLogs[logisticsLogs.length - 1].message : null

  const delivered = allOrders?.filter((o) => o.order_status === "delivered").length || 0
  const inTransit = allOrders?.filter((o) => ["in_transit", "shipped"].includes(o.order_status)).length || 0
  const pending = pendingOrders?.length || 0

  const pendingColumns = [
    { key: "order_id", label: "Order ID", className: "font-mono text-xs" as string },
    { key: "sku", label: "SKU", className: "font-mono text-xs" as string },
    {
      key: "quantity",
      label: "Quantity",
      render: (o: Order) => <span className="font-mono font-medium">{o.quantity}</span>,
    },
    {
      key: "order_status",
      label: "Status",
      render: (o: Order) => <StatusBadge label={o.order_status} variant={orderStatusVariant(o.order_status)} />,
    },
    {
      key: "created_at",
      label: "Created",
      render: (o: Order) => <span className="text-xs text-muted-foreground">{o.created_at || "N/A"}</span>,
    },
  ]

  const allOrderColumns = [
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
      render: (o: Order) => <StatusBadge label={o.order_status} variant={orderStatusVariant(o.order_status)} />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Logistics Coordinator"
        description="Manage pending deliveries, track order fulfillment, and optimize delivery routes."
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Pending Deliveries" value={pending} variant={pending > 0 ? "warning" : "success"} />
        <KPICard label="In Transit" value={inTransit} variant="info" />
        <KPICard label="Delivered" value={delivered} variant="success" />
        <KPICard label="Total Orders" value={allOrders?.length || 0} variant="neutral" />
      </div>

      {/* Agent Output / Route Suggestion */}
      {lastOutput && (
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
          <h3 className="mb-2 text-sm font-medium text-cyan-400">Latest Logistics Agent Output</h3>
          <p className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{lastOutput}</p>
        </div>
      )}

      {/* Route Optimization & Driver Schedule */}
      <div className="grid grid-cols-2 gap-4">
        {/* Route Optimization Map Placeholder */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Route Optimization</h3>
          <div className="flex flex-col gap-2">
            {[
              { driver: "Driver A", stops: 8, distance: "34.2 mi", saved: "12 mi", eta: "2h 15m" },
              { driver: "Driver B", stops: 6, distance: "28.7 mi", saved: "8 mi", eta: "1h 50m" },
              { driver: "Driver C", stops: 5, distance: "22.1 mi", saved: "5 mi", eta: "1h 20m" },
            ].map((route) => (
              <div key={route.driver} className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-400">
                    {route.driver.split(" ")[1]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{route.driver}</p>
                    <p className="text-xs text-muted-foreground">{route.stops} stops - {route.distance}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-success">Saved {route.saved}</span>
                  <p className="text-xs text-muted-foreground">ETA: {route.eta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Schedule View */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Driver Schedule</h3>
          <div className="flex flex-col gap-2">
            {[
              { name: "Alex R.", shift: "06:00 - 14:00", status: "On Route", deliveries: 5, available: false },
              { name: "Maria S.", shift: "08:00 - 16:00", status: "On Route", deliveries: 3, available: false },
              { name: "James T.", shift: "10:00 - 18:00", status: "Available", deliveries: 0, available: true },
              { name: "Pat K.", shift: "12:00 - 20:00", status: "Break", deliveries: 4, available: false },
            ].map((driver) => (
              <div key={driver.name} className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${driver.available ? "bg-success" : driver.status === "Break" ? "bg-warning" : "bg-info"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{driver.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{driver.shift}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${driver.available ? "text-success" : driver.status === "Break" ? "text-warning" : "text-info"}`}>
                    {driver.status}
                  </span>
                  <p className="text-xs text-muted-foreground">{driver.deliveries} deliveries today</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Performance Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">On-Time Rate</span>
          <p className="mt-1 text-2xl font-bold text-success">96.2%</p>
          <p className="text-xs text-muted-foreground">+2.1% from last week</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Delivery Time</span>
          <p className="mt-1 text-2xl font-bold text-foreground">42 min</p>
          <p className="text-xs text-muted-foreground">-8 min from last week</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost per Route</span>
          <p className="mt-1 text-2xl font-bold text-foreground font-mono">$18.40</p>
          <p className="text-xs text-success">-$3.20 after optimization</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fuel Saved</span>
          <p className="mt-1 text-2xl font-bold text-success">18%</p>
          <p className="text-xs text-muted-foreground">This month vs last</p>
        </div>
      </div>

      {/* Pending Deliveries Board */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Pending Deliveries {!pendingLoading && `(${pending})`}
        </h2>
        {pendingLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading pending orders...</div>
        ) : (
          <DataTable
            columns={pendingColumns}
            data={pendingOrders || []}
            rowKey={(o) => o.order_id}
            emptyMessage="No pending deliveries"
          />
        )}
      </div>

      {/* All Orders */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">All Orders</h2>
        <DataTable
          columns={allOrderColumns}
          data={allOrders || []}
          rowKey={(o) => o.order_id}
          emptyMessage="No orders found"
        />
      </div>
    </div>
  )
}
