"use client"

import { useState } from "react"
import { fetchCustomer } from "@/lib/api"
import { useCrew } from "@/components/crew-provider"
import { PageHeader } from "@/components/page-header"
import type { Customer } from "@/lib/types"

const TIER_CONFIG: Record<string, { color: string; bg: string; offers: string }> = {
  gold: {
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    offers: "20% off entire purchase, free shipping, exclusive early access to new products, birthday gift.",
  },
  silver: {
    color: "text-gray-300",
    bg: "bg-gray-300/10 border-gray-300/30",
    offers: "15% off select items, free shipping on orders over $50, loyalty points 2x multiplier.",
  },
  bronze: {
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/30",
    offers: "10% off first purchase of the month, standard loyalty points accrual.",
  },
  standard: {
    color: "text-muted-foreground",
    bg: "bg-secondary border-border",
    offers: "Welcome discount 5% on signup, standard loyalty points.",
  },
}

export default function CustomersPage() {
  const { logs } = useCrew()
  const [searchId, setSearchId] = useState("")
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const customerLogs = logs.filter((l) => l.agent === "Customer Service Representative")
  const lastOutput = customerLogs.length > 0 ? customerLogs[customerLogs.length - 1].message : null

  async function handleLookup() {
    if (!searchId.trim()) return
    setLoading(true)
    setError(null)
    setCustomer(null)
    try {
      const data = await fetchCustomer(searchId.trim())
      setCustomer(data)
    } catch {
      setError("Customer not found or API unavailable.")
    } finally {
      setLoading(false)
    }
  }

  const tier = customer?.loyalty_tier?.toLowerCase() || "standard"
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.standard

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customer Service"
        description="Look up customer profiles, check loyalty tiers, and view personalized offer recommendations."
      />

      {/* Loyalty Tier Guide */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Loyalty Tier Guide</h2>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(TIER_CONFIG).map(([name, cfg]) => (
            <div key={name} className={`rounded-lg border p-4 ${cfg.bg}`}>
              <span className={`text-sm font-semibold capitalize ${cfg.color}`}>{name}</span>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{cfg.offers}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Lookup */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-foreground">Customer Lookup</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="Enter customer ID (e.g. cust-001)..."
            className="h-9 flex-1 max-w-sm rounded-md border border-input bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleLookup}
            disabled={loading || !searchId.trim()}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Searching..." : "Look Up"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        {customer && (
          <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-medium text-foreground">{customer.name || customer.customer_id}</p>
                <p className="mt-0.5 text-xs text-muted-foreground font-mono">{customer.customer_id}</p>
              </div>
              <div className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tierCfg.bg} ${tierCfg.color}`}>
                {tier}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {customer.email && (
                <div>
                  <span className="text-xs text-muted-foreground">Email</span>
                  <p className="text-sm text-foreground">{customer.email}</p>
                </div>
              )}
              {customer.phone && (
                <div>
                  <span className="text-xs text-muted-foreground">Phone</span>
                  <p className="text-sm text-foreground">{customer.phone}</p>
                </div>
              )}
              {customer.total_purchases !== undefined && (
                <div>
                  <span className="text-xs text-muted-foreground">Total Purchases</span>
                  <p className="text-sm font-mono text-foreground">{customer.total_purchases}</p>
                </div>
              )}
              {customer.preferences && customer.preferences.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Preferences</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {customer.preferences.map((pref) => (
                      <span key={pref} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggested offer */}
            <div className="mt-4 rounded-md bg-primary/5 border border-primary/20 p-3">
              <span className="text-xs font-medium text-primary">Suggested Offer for {tier} tier</span>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{tierCfg.offers}</p>
            </div>
          </div>
        )}
      </div>

      {/* Agent Output */}
      {lastOutput && (
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
          <h3 className="mb-2 text-sm font-medium text-purple-400">Latest Customer Service Agent Output</h3>
          <p className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{lastOutput}</p>
        </div>
      )}
    </div>
  )
}
