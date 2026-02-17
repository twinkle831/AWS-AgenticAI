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
