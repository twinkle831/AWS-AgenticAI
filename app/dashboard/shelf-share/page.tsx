"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"
import { ImageUploadZone } from "@/components/shelf-share/image-upload-zone"
import { ShelfAnalysisResults } from "@/components/shelf-share/shelf-analysis-results"
import { AnalysisHistory } from "@/components/shelf-share/analysis-history"
import type { ShelfAnalysis } from "@/lib/types"

// Shelf Share Monitor - AI-powered shelf space analysis with AWS integration
export default function ShelfSharePage() {
  const [currentAnalysis, setCurrentAnalysis] = useState<ShelfAnalysis | null>(null)
  const [allAnalyses, setAllAnalyses] = useState<ShelfAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState("Beverage Aisle")

  // Load analysis history on mount
  useEffect(() => {
    loadAnalysisHistory()
  }, [])

  const loadAnalysisHistory = async () => {
    try {
      const response = await fetch("/api/shelf-share/history?limit=50")
      if (!response.ok) {
        console.log("[v0] Failed to load history:", response.status)
        return
      }
      const data = await response.json()
      if (data.success) {
        // Ensure data.data is always an array
        const historyData = Array.isArray(data.data) ? data.data : []
        console.log("[v0] Loaded", historyData.length, "analyses from history")
        setAllAnalyses(historyData)
      } else {
        console.log("[v0] API returned unsuccessful response, using empty array")
        setAllAnalyses([])
      }
    } catch (err) {
      console.log("[v0] Error loading history:", err)
      setAllAnalyses([])
    }
  }

  const handleImageSelect = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Image = (e.target?.result as string).split(",")[1] // Remove data:image/jpeg;base64, prefix

        try {
          console.log("[v0] Sending image to API for analysis...")
          const response = await fetch("/api/shelf-share/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64Image,
              shelfLocation: selectedLocation,
              storeId: "default",
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Analysis failed with status ${response.status}`)
          }

          const result = await response.json()
          if (result.success && result.data) {
            console.log("[v0] Analysis complete:", result.data)
            setCurrentAnalysis(result.data)
            const currentData = Array.isArray(allAnalyses) ? allAnalyses : []
            setAllAnalyses([result.data, ...currentData])
          } else {
            throw new Error(result.error || "Unknown error occurred")
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to analyze image"
          console.error("[v0] API Error:", errorMessage)
          setError(errorMessage)
        } finally {
          setIsLoading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process file"
      console.error("[v0] Error:", errorMessage)
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const analyses = Array.isArray(allAnalyses) ? allAnalyses : []
  const stats = {
    totalAnalyses: analyses.length,
    avgHealthScore: analyses.length > 0 ? Math.round(analyses.reduce((sum, a) => sum + a.shelf_health_score, 0) / analyses.length) : 0,
    totalIssuesDetected: analyses.reduce((sum, a) => sum + (a.issues?.length || 0), 0),
    shelvesMonitored: new Set(analyses.map((a) => a.shelf_location)).size,
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

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
            <div className="flex gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-danger flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="text-sm font-medium text-foreground">Analysis Error</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

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
      <AnalysisHistory analyses={analyses} />

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
