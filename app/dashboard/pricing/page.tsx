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

      {/* Competitor Price Tracker */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">Competitor Price Tracker</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Our Price</th>
                <th className="py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Competitor A</th>
                <th className="py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Competitor B</th>
                <th className="py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Widget Alpha", ours: 24.99, a: 26.50, b: 23.75 },
                { name: "Sensor Module", ours: 89.00, a: 92.00, b: 95.00 },
                { name: "Cable Kit", ours: 15.50, a: 14.99, b: 16.00 },
                { name: "LED Panel", ours: 45.00, a: 44.50, b: 48.00 },
              ].map((row) => {
                const lowest = Math.min(row.ours, row.a, row.b)
                const isLowest = row.ours === lowest
                return (
                  <tr key={row.name} className="border-b border-border last:border-0">
                    <td className="py-2 text-foreground">{row.name}</td>
                    <td className={`py-2 text-right font-mono ${isLowest ? "text-success font-medium" : "text-foreground"}`}>${row.ours.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono text-muted-foreground">${row.a.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono text-muted-foreground">${row.b.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <span className={`text-xs font-medium ${isLowest ? "text-success" : "text-warning"}`}>
                        {isLowest ? "Lowest" : "Above"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Rules & Revenue Impact */}
      <div className="grid grid-cols-2 gap-4">
        {/* Price Rule Builder */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Price Rule Builder</h3>
          <div className="flex flex-col gap-3">
            {[
              { rule: "Price Floor", value: "$10.00", condition: "Never sell below cost + 20%", active: true },
              { rule: "Price Ceiling", value: "$199.99", condition: "Cap on premium items", active: true },
              { rule: "Demand Surge", value: "+15%", condition: "When stock < 20% threshold", active: true },
              { rule: "Clearance Trigger", value: "-25%", condition: "When stock > 300% of target", active: false },
            ].map((r) => (
              <div key={r.rule} className={`flex items-center justify-between rounded-md border px-3 py-2 ${r.active ? "border-success/30 bg-success/5" : "border-border bg-secondary/30"}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{r.rule}: <span className="font-mono text-primary">{r.value}</span></p>
                  <p className="text-xs text-muted-foreground">{r.condition}</p>
                </div>
                <div className={`h-2 w-2 rounded-full ${r.active ? "bg-success" : "bg-muted-foreground/30"}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Impact Simulator */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Revenue Impact Simulator</h3>
          <div className="flex flex-col gap-4">
            <div className="rounded-md bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">If all LOW stock prices raised +10%</p>
              <p className="text-lg font-bold text-success font-mono">+$2,340</p>
              <p className="text-xs text-muted-foreground">Projected additional monthly revenue</p>
            </div>
            <div className="rounded-md bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">If all HIGH stock items discounted -15%</p>
              <p className="text-lg font-bold text-info font-mono">+$5,120</p>
              <p className="text-xs text-muted-foreground">Projected revenue from increased volume</p>
            </div>
            <div className="rounded-md bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">Net projected impact</p>
              <p className="text-lg font-bold text-primary font-mono">+$7,460</p>
              <p className="text-xs text-muted-foreground">Combined revenue optimization</p>
            </div>
          </div>
        </div>
      </div>

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
