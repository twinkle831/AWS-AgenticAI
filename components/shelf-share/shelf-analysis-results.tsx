import { StatusBadge } from "@/components/status-badge"
import { KPICard } from "@/components/kpi-card"
import { BrandSpaceVisualization } from "./brand-space-visualization"
import type { ShelfAnalysis } from "@/lib/types"

interface ShelfAnalysisResultsProps {
  analysis: ShelfAnalysis
}

export function ShelfAnalysisResults({ analysis }: ShelfAnalysisResultsProps) {
  const getHealthVariant = (score: number) => {
    if (score >= 80) return "success"
    if (score >= 60) return "info"
    if (score >= 40) return "warning"
    return "danger"
  }

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Poor"
  }

  const issueCounts = {
    empty_spot: analysis.issues.filter((i) => i.type === "empty_spot").length,
    misplaced: analysis.issues.filter((i) => i.type === "misplaced_product").length,
    damaged: analysis.issues.filter((i) => i.type === "damaged_item").length,
  }

  const totalIssues = analysis.issues.length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{analysis.shelf_location}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analyzed on {new Date(analysis.analyzed_at).toLocaleDateString()} at{" "}
            {new Date(analysis.analyzed_at).toLocaleTimeString()}
          </p>
        </div>
        <StatusBadge
          label={getHealthLabel(analysis.shelf_health_score)}
          variant={getHealthVariant(analysis.shelf_health_score)}
        />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Shelf Health"
          value={`${analysis.shelf_health_score}%`}
          variant={getHealthVariant(analysis.shelf_health_score)}
        />
        <KPICard label="Brands Found" value={analysis.brands.length} variant="info" />
        <KPICard
          label="Total Issues"
          value={totalIssues}
          variant={totalIssues === 0 ? "success" : totalIssues <= 2 ? "warning" : "danger"}
        />
        <KPICard label="Coverage" value={`${Math.round(analysis.brands.reduce((sum, b) => sum + b.percentage, 0))}%`} variant="neutral" />
      </div>

      {/* Brand Space Visualization */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">Brand Space Allocation</h3>
        <BrandSpaceVisualization brands={analysis.brands} />
      </div>

      {/* Issues Section */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">Detected Issues</h3>

        {totalIssues === 0 ? (
          <div className="flex items-center gap-3 py-6 px-4 bg-success/10 rounded-lg border border-success/20">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-success flex-shrink-0"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-sm text-foreground">Shelf looks great! No issues detected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground font-medium">Empty Spots</p>
              <p className="text-lg font-bold text-warning mt-1">{issueCounts.empty_spot}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground font-medium">Misplaced</p>
              <p className="text-lg font-bold text-info mt-1">{issueCounts.misplaced}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground font-medium">Damaged</p>
              <p className="text-lg font-bold text-danger mt-1">{issueCounts.damaged}</p>
            </div>
          </div>
        )}

        {totalIssues > 0 && (
          <div className="flex flex-col gap-2">
            {analysis.issues.map((issue, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{issue.description}</span>
                  <StatusBadge
                    label={issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                    variant={issue.severity === "high" ? "danger" : issue.severity === "medium" ? "warning" : "info"}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {issue.type === "empty_spot" ? "Empty Spot" : issue.type === "misplaced_product" ? "Misplaced Product" : "Damaged Item"} • {issue.location}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
