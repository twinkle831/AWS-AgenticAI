"use client"

import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import type { ShelfAnalysis, StatusVariant } from "@/lib/types"

interface AnalysisHistoryProps {
  analyses: ShelfAnalysis[]
}

export function AnalysisHistory({ analyses }: AnalysisHistoryProps) {
  const getHealthVariant = (score: number): StatusVariant => {
    if (score >= 80) return "success"
    if (score >= 60) return "info"
    if (score >= 40) return "warning"
    return "danger"
  }

  // Format date consistently without locale-specific formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` }
  }

  const columns = [
    {
      key: "analyzed_at",
      label: "Date & Time",
      render: (analysis: ShelfAnalysis) => {
        const { date, time } = formatDate(analysis.analyzed_at)
        return (
          <span className="text-sm">
            {date}{" "}
            <span className="text-muted-foreground text-xs">
              {time}
            </span>
          </span>
        )
      },
    },
    {
      key: "shelf_location",
      label: "Shelf Location",
      render: (analysis: ShelfAnalysis) => <span className="font-medium text-foreground">{analysis.shelf_location}</span>,
    },
    {
      key: "brands",
      label: "Brands Found",
      render: (analysis: ShelfAnalysis) => <span className="font-mono text-sm">{analysis.brands.length}</span>,
    },
    {
      key: "coverage",
      label: "Coverage",
      render: (analysis: ShelfAnalysis) => (
        <span className="font-mono text-sm font-medium text-primary">
          {Math.round(analysis.brands.reduce((sum, b) => sum + b.percentage, 0))}%
        </span>
      ),
    },
    {
      key: "issues",
      label: "Issues",
      render: (analysis: ShelfAnalysis) => (
        <span className="font-mono text-sm">
          {analysis.issues.length === 0 ? (
            <span className="text-success">None</span>
          ) : (
            <span className="text-warning">{analysis.issues.length} found</span>
          )}
        </span>
      ),
    },
    {
      key: "shelf_health_score",
      label: "Health Score",
      render: (analysis: ShelfAnalysis) => (
        <StatusBadge
          label={`${analysis.shelf_health_score}%`}
          variant={getHealthVariant(analysis.shelf_health_score)}
        />
      ),
    },
  ]

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">Analysis History</h3>
      {analyses.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          No analyses yet. Upload a shelf photo to get started.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={analyses}
          rowKey={(analysis) => analysis.analysis_id}
          emptyMessage="No analysis history"
        />
      )}
    </div>
  )
}
