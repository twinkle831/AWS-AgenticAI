"use client"

import useSWR from "swr"
import { fetchAllInventory } from "@/lib/api"
import { useCrew } from "@/components/crew-provider"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import type { InventoryItem, StatusVariant } from "@/lib/types"

interface PricingRow extends InventoryItem {
  stockLevel: "LOW" | "NORMAL" | "HIGH"
  recommendation: string
}

function classifyStock(item: InventoryItem): "LOW" | "NORMAL" | "HIGH" {
  if (item.quantity <= item.reorder_threshold) return "LOW"
  if (item.quantity >= item.reorder_threshold * 3) return "HIGH"
  return "NORMAL"
}

function getRecommendation(level: "LOW" | "NORMAL" | "HIGH"): string {
  switch (level) {
    case "LOW":
      return "Consider raising price or limiting discounts to manage demand until restocked."
    case "HIGH":
      return "Suggest a promotion or discount to move excess inventory and free up space."
    case "NORMAL":
      return "Maintain current pricing. Stock levels are within normal range."
  }
}

function levelVariant(level: "LOW" | "NORMAL" | "HIGH"): StatusVariant {
  if (level === "LOW") return "danger"
  if (level === "HIGH") return "info"
  return "success"
}

export default function PricingPage() {
  const { logs, isRunning } = useCrew()

  const { data: inventory, isLoading } = useSWR("all-inventory", fetchAllInventory, { refreshInterval: 15000 })

  const pricingRows: PricingRow[] = (inventory || []).map((item) => {
    const stockLevel = classifyStock(item)
    return {
      ...item,
      stockLevel,
      recommendation: getRecommendation(stockLevel),
    }
  })

  // Extract pricing-related logs from the crew run
  const pricingLogs = logs.filter((l) => l.agent === "Pricing Analyst")
  const lastPricingOutput = pricingLogs.length > 0 ? pricingLogs[pricingLogs.length - 1].message : null

  const columns = [
    { key: "sku", label: "SKU", className: "font-mono text-xs" as string },
    { key: "name", label: "Product" },
    {
      key: "quantity",
      label: "Qty",
      render: (r: PricingRow) => <span className="font-mono">{r.quantity}</span>,
    },
    {
      key: "reorder_threshold",
      label: "Reorder At",
      render: (r: PricingRow) => <span className="font-mono text-muted-foreground">{r.reorder_threshold}</span>,
    },
    {
      key: "stockLevel",
      label: "Stock Level",
      render: (r: PricingRow) => <StatusBadge label={r.stockLevel} variant={levelVariant(r.stockLevel)} />,
    },
    {
      key: "recommendation",
      label: "Pricing Recommendation",
      className: "max-w-xs" as string,
      render: (r: PricingRow) => <span className="text-xs text-muted-foreground">{r.recommendation}</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pricing Analyst"
        description="Dynamic pricing recommendations based on current stock levels and demand patterns."
        actions={
          isRunning ? (
            <span className="flex items-center gap-2 text-sm text-success">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Analyzing...
            </span>
          ) : null
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Low Stock SKUs</span>
          <span className="text-2xl font-bold text-danger">{pricingRows.filter((r) => r.stockLevel === "LOW").length}</span>
          <span className="text-xs text-muted-foreground">Raise price / limit discounts</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Normal Stock SKUs</span>
          <span className="text-2xl font-bold text-success">{pricingRows.filter((r) => r.stockLevel === "NORMAL").length}</span>
          <span className="text-xs text-muted-foreground">Maintain current pricing</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">High Stock SKUs</span>
          <span className="text-2xl font-bold text-info">{pricingRows.filter((r) => r.stockLevel === "HIGH").length}</span>
          <span className="text-xs text-muted-foreground">Consider promotions</span>
        </div>
      </div>

      {/* Agent Output (if available from crew run) */}
      {lastPricingOutput && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <h3 className="mb-2 text-sm font-medium text-primary">Latest Pricing Agent Output</h3>
          <p className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{lastPricingOutput}</p>
        </div>
      )}

      {/* Pricing Table */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Pricing Dashboard {!isLoading && `(${pricingRows.length} SKUs)`}
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading pricing data...</div>
        ) : (
          <DataTable columns={columns} data={pricingRows} rowKey={(r) => r.sku} emptyMessage="No inventory data for pricing analysis" />
        )}
      </div>
    </div>
  )
}
