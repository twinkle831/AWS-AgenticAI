import type { StatusVariant } from "@/lib/types"

const VARIANT_STYLES: Record<StatusVariant, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  neutral: "bg-secondary text-secondary-foreground",
}

interface StatusBadgeProps {
  label: string
  variant?: StatusVariant
}

export function StatusBadge({ label, variant = "neutral" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_STYLES[variant]}`}>
      {label}
    </span>
  )
}
