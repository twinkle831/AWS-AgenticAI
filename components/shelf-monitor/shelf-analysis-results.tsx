'use client'

import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { BrandShareChart } from './brand-share-chart'
import { ComplianceStatus } from './compliance-status'

interface ShelfAnalysisResultsProps {
  results: {
    shelfId: string
    timestamp: Date
    brands: Array<{ name: string; percentage: number; color: string }>
    issues: Array<{ type: string; location: string; severity: string }>
    complianceStatus: Array<{
      brand: string
      contractRequired: string
      actual: string
      status: string
    }>
    imageUrl: string
  }
}

export function ShelfAnalysisResults({ results }: ShelfAnalysisResultsProps) {
  const topBrand = results.brands[0]
  const hasIssues = results.issues.length > 0
  const complianceIssues = results.complianceStatus.filter(
    (item) => item.status !== 'success'
  ).length

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Top Brand</p>
            <p className="text-2xl font-bold text-foreground">{topBrand.name}</p>
            <p className="text-sm text-primary font-semibold">{topBrand.percentage}% of shelf</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Shelf ID</p>
            <p className="font-mono text-sm text-foreground break-all">{results.shelfId}</p>
            <p className="text-xs text-muted-foreground">
              {results.timestamp.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Issues Found</p>
            <p className="text-2xl font-bold text-foreground">{results.issues.length}</p>
            {hasIssues && (
              <p className="text-xs text-warning flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Action needed
              </p>
            )}
            {!hasIssues && (
              <p className="text-xs text-success flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                All clear
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Compliance</p>
            <p className="text-2xl font-bold text-foreground">
              {results.complianceStatus.length - complianceIssues}/{results.complianceStatus.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {complianceIssues > 0 ? `${complianceIssues} contract warning` : 'On track'}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart */}
        <BrandShareChart brands={results.brands} />

        {/* Image Preview */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-muted">
            <img
              src={results.imageUrl}
              alt="Analyzed shelf"
              className="h-full w-full object-cover"
            />
          </div>
        </Card>
      </div>

      {/* Issues & Compliance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Issues Section */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Detected Issues</h3>
          {results.issues.length === 0 ? (
            <p className="text-sm text-muted-foreground">No issues detected</p>
          ) : (
            <div className="space-y-3">
              {results.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  {issue.severity === 'high' && (
                    <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                  )}
                  {issue.severity === 'medium' && (
                    <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  )}
                  {issue.severity === 'low' && (
                    <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground capitalize">
                      {issue.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">{issue.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Compliance Section */}
        <ComplianceStatus complianceStatus={results.complianceStatus} />
      </div>
    </div>
  )
}
