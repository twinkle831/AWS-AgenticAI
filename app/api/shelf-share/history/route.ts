import { NextRequest, NextResponse } from "next/server"
import { queryAnalysisHistory } from "@/lib/aws-services"
import type { ShelfAnalysisResponse } from "@/lib/types"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams
    const storeId = searchParams.get("storeId") || "default"
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const afterParam = searchParams.get("after")
    const afterTimestamp = afterParam ? parseInt(afterParam) : undefined

    // Query from DynamoDB
    let items: any[] = []
    try {
      items = await queryAnalysisHistory(storeId, limit, afterTimestamp)
    } catch (error) {
      console.log("[v0] DynamoDB query failed, returning empty history for demonstration")
      // Return empty array on error
      items = []
    }

    // Convert DynamoDB items to analysis objects
    const analyses = items.map((item: any) => ({
      analysis_id: item.analysisId?.S || item.analysisId,
      shelf_location: item.shelfLocation?.S || item.shelfLocation,
      image_url: item.imageUrl?.S || item.imageUrl,
      analyzed_at: new Date(parseInt(item.analyzedAt?.N || item.analyzedAt || "0")).toISOString(),
      shelf_health_score: parseInt(item.healthScore?.N || item.healthScore || "0"),
      brands: typeof item.brands === "string" ? JSON.parse(item.brands) : item.brands || [],
      issues: typeof item.issues === "string" ? JSON.parse(item.issues) : item.issues || [],
      insights: item.insights?.S || item.insights,
      contractCompliance: typeof item.contractCompliance === "string" ? JSON.parse(item.contractCompliance) : item.contractCompliance || [],
    }))

    return NextResponse.json(
      {
        success: true,
        data: analyses,
        message: `Retrieved ${analyses.length} analyses`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] History API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve analysis history",
        data: [],
      },
      { status: 200 }
    )
  }
}
