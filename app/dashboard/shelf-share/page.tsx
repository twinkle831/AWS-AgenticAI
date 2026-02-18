"use client"

import { useState } from "react"
import useSWR from "swr"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"
import { ImageUploadZone } from "@/components/shelf-share/image-upload-zone"
import { ShelfAnalysisResults } from "@/components/shelf-share/shelf-analysis-results"
import { AnalysisHistory } from "@/components/shelf-share/analysis-history"
import type { ShelfAnalysis } from "@/lib/types"

// Mock data generator for demonstration
function generateMockAnalysis(fileName: string, shelfLocation: string): ShelfAnalysis {
  const brandColors: Record<string, string> = {
    "Coca-Cola": "#EF3B36",
    Pepsi: "#004687",
    "Dr Pepper": "#A8142F",
    Sprite: "#90EE90",
    Fanta: "#FF6B35",
    Dasani: "#1F77B4",
    Minute_Maid: "#FF8C00",
    Other: "#888888",
  }

  const brands = [
    { name: "Coca-Cola", percentage: 38 },
    { name: "Pepsi", percentage: 31 },
    { name: "Dr Pepper", percentage: 18 },
    { name: "Sprite", percentage: 8 },
    { name: "Other", percentage: 5 },
  ]

  const issues = [
    {
      type: "empty_spot" as const,
      severity: "medium" as const,
      location: "Shelf Right Side",
      description: "Empty shelf space detected on the right side",
    },
    {
      type: "misplaced_product" as const,
      severity: "low" as const,
      location: "Center Section",
      description: "Sprite product found in Coca-Cola section",
    },
  ]

  return {
    analysis_id: `analysis-${Date.now()}`,
    shelf_location: shelfLocation,
    image_url: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
    analyzed_at: new Date().toISOString(),
    shelf_health_score: 74,
    brands: brands.map((b) => ({
      brand_name: b.name,
      percentage: b.percentage,
      color: brandColors[b.name] || brandColors["Other"],
    })),
    issues,
  }
}

export default function ShelfSharePage() {
  const [currentAnalysis, setCurrentAnalysis] = useState<ShelfAnalysis | null>(null)
  const [allAnalyses, setAllAnalyses] = useState<ShelfAnalysis[]>([
    generateMockAnalysis("sample1.jpg", "Beverage Aisle - Section A"),
    generateMockAnalysis("sample2.jpg", "Beverage Aisle - Section B"),
    generateMockAnalysis("sample3.jpg", "Water Coolers - Display"),
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("Beverage Aisle")

  const handleImageSelect = async (file: File) => {
    setIsLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      const newAnalysis = generateMockAnalysis(file.name, selectedLocation)
      setCurrentAnalysis(newAnalysis)
      setAllAnalyses([newAnalysis, ...allAnalyses])
      setIsLoading(false)
    }, 2000)
  }

  const stats = {
    totalAnalyses: allAnalyses.length,
    avgHealthScore: Math.round(allAnalyses.reduce((sum, a) => sum + a.shelf_health_score, 0) / allAnalyses.length),
    totalIssuesDetected: allAnalyses.reduce((sum, a) => sum + a.issues.length, 0),
    shelvesMonitored: new Set(allAnalyses.map((a) => a.shelf_location)).size,
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Shelf Share Monitor"
        description="Analyze shelf space occupancy, detect issues, and track brand presence with AI-powered insights."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Analyses" value={stats.totalAnalyses} variant="neutral" />
        <KPICard label="Avg Health Score" value={`${stats.avgHealthScore}%`} variant="info" />
        <KPICard label="Issues Detected" value={stats.totalIssuesDetected} variant="warning" />
        <KPICard label="Shelves Monitored" value={stats.shelvesMonitored} variant="success" />
      </div>

      {/* Upload Section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Upload Shelf Photo for Analysis</h2>

        {/* Shelf Location Input */}
        <div className="mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shelf Location</label>
          <div className="mt-2 flex gap-2">
            {["Beverage Aisle", "Snacks", "Dairy", "Frozen"].map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  selectedLocation === location
                    ? "bg-primary/15 text-primary border border-primary"
                    : "bg-secondary text-foreground border border-border hover:bg-secondary/80"
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload Zone */}
        <ImageUploadZone onImageSelect={handleImageSelect} isLoading={isLoading} />
      </div>

      {/* Current Analysis Results */}
      {currentAnalysis && (
        <div className="rounded-lg border border-border bg-card p-6">
          <ShelfAnalysisResults analysis={currentAnalysis} />
        </div>
      )}

      {/* Historical Data */}
      <AnalysisHistory analyses={allAnalyses} />

      {/* AI Insights Info Box */}
      {!currentAnalysis && (
        <div className="rounded-lg border border-info/30 bg-info/5 p-4">
          <div className="flex gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-info flex-shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <div>
              <p className="text-sm font-medium text-foreground">How it works</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a photo of any shelf to instantly see brand space allocation, detect empty spots, misplaced products, and
                damaged items. AI analyzes the image and provides a health score and actionable insights.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
