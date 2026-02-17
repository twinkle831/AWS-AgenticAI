"use client"

import useSWR from "swr"
import { checkHealth } from "@/lib/api"

export function HealthIndicator() {
  const { data, error } = useSWR("api-health", checkHealth, {
    refreshInterval: 15000,
    shouldRetryOnError: true,
    errorRetryInterval: 5000,
  })

  const isConnected = !!data && !error
  const isLoading = !data && !error

  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${
          isLoading
            ? "bg-warning animate-pulse"
            : isConnected
              ? "bg-success"
              : "bg-danger"
        }`}
      />
      <span className="text-xs text-muted-foreground">
        {isLoading
          ? "Connecting..."
          : isConnected
            ? "API Connected"
            : "API Offline"}
      </span>
    </div>
  )
}
