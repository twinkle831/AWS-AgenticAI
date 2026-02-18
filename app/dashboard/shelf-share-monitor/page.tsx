'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { ImageUploadCard } from '@/components/shelf-monitor/image-upload-card'
import { ShelfAnalysisResults } from '@/components/shelf-monitor/shelf-analysis-results'
import { HistoricalTracking } from '@/components/shelf-monitor/historical-tracking'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ShelfShareMonitorPage() {
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyzeImage = async (file: File) => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock analysis results
    const mockResults = {
      shelfId: `SHELF-${Date.now()}`,
      timestamp: new Date(),
      brands: [
        { name: 'Coca-Cola', percentage: 38, color: '#ef4444' },
        { name: 'Pepsi', percentage: 31, color: '#3b82f6' },
        { name: 'Dr Pepper', percentage: 18, color: '#f59e0b' },
        { name: 'Sprite', percentage: 13, color: '#22c55e' },
      ],
      issues: [
        { type: 'empty_spot', location: 'Bottom left', severity: 'medium' },
        { type: 'misplaced_product', product: 'Fanta', correctBrand: 'Coca-Cola', severity: 'low' },
      ],
      complianceStatus: [
        { brand: 'Coca-Cola', contractRequired: '40%', actual: '38%', status: 'warning' },
        { brand: 'Pepsi', contractRequired: '35%', actual: '31%', status: 'warning' },
      ],
      imageUrl: URL.createObjectURL(file),
    }
    
    setAnalysisResults(mockResults)
    setIsAnalyzing(false)
  }

  return (
    <main className="flex-1 space-y-6 p-6 md:p-8">
      <PageHeader
        title="Shelf Share Monitor"
        description="AI-powered shelf space analysis to track brand compliance and optimize merchandising"
      />

      <Tabs defaultValue="analyze" className="space-y-6">
        <TabsList className="grid w-fit grid-cols-3">
          <TabsTrigger value="analyze">Analyze Shelf</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-6">
          <ImageUploadCard
            onAnalyze={handleAnalyzeImage}
            isAnalyzing={isAnalyzing}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {analysisResults ? (
            <ShelfAnalysisResults results={analysisResults} />
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No analysis results yet. Upload and analyze a shelf image to get started.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <HistoricalTracking />
        </TabsContent>
      </Tabs>
    </main>
  )
}
