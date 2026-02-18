'use client'

import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ComplianceStatusProps {
  complianceStatus: Array<{
    brand: string
    contractRequired: string
    actual: string
    status: string
  }>
}

export function ComplianceStatus({ complianceStatus }: ComplianceStatusProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Contract Compliance</h3>
      <div className="space-y-3">
        {complianceStatus.map((item, idx) => {
          const required = parseFloat(item.contractRequired)
          const actual = parseFloat(item.actual)
          const difference = actual - required
          const isCompliant = actual >= required

          return (
            <div key={idx} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm text-foreground">{item.brand}</p>
                <div className="flex items-center gap-1">
                  {isCompliant ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      isCompliant ? 'text-success' : 'text-warning'
                    }`}
                  >
                    {difference >= 0 ? '+' : ''}{difference.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Required: {item.contractRequired}</span>
                <span>Actual: {item.actual}</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(100, (actual / required) * 100)}%`,
                    backgroundColor: isCompliant ? '#22c55e' : '#f59e0b',
                  }}
                  className="h-full transition-all duration-300"
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
