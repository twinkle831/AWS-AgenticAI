import type { StatusVariant } from "@/lib/types"

const VARIANT_STYLES: Record<StatusVariant, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
  neutral: "text-foreground",
}

interface KPICardProps {
  label: string
  value: string | number
  variant?: StatusVariant
  subtitle?: string
  icon?: React.ReactNode
}

export function KPICard({ label, value, variant = "neutral", subtitle, icon }: KPICardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <span className={`text-2xl font-bold ${VARIANT_STYLES[variant]}`}>{value}</span>
      {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
    </div>
  )
}
