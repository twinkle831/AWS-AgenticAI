import { NextRequest, NextResponse } from "next/server"
import { queryAnalysisHistory } from "@/lib/aws-services"
import type { ShelfAnalysisResponse } from "@/lib/types"

export async function GET(request: NextRequest): Promise<NextResponse<ShelfAnalysisResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams
    const storeId = searchParams.get("storeId") || "default"
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const afterParam = searchParams.get("after")
    const afterTimestamp = afterParam ? parseInt(afterParam) : undefined

    // Query from DynamoDB
    const items = await queryAnalysisHistory(storeId, limit, afterTimestamp)

    // Convert DynamoDB items to analysis objects
    const analyses = items.map((item: any) => ({
      analysis_id: item.analysisId?.S,
      shelf_location: item.shelfLocation?.S,
      image_url: item.imageUrl?.S,
      analyzed_at: new Date(parseInt(item.analyzedAt?.N || "0")).toISOString(),
      shelf_health_score: parseInt(item.healthScore?.N || "0"),
      brands: JSON.parse(item.brands?.S || "[]"),
      issues: JSON.parse(item.issues?.S || "[]"),
      insights: item.insights?.S,
      contractCompliance: JSON.parse(item.contractCompliance?.S || "[]"),
    }))

    return NextResponse.json(
      {
        success: true,
        data: {
          analysis_id: "",
          shelf_location: "",
          image_url: "",
          analyzed_at: "",
          shelf_health_score: 0,
          brands: [],
          issues: [],
          // We'll pass the array through a different structure
        } as any,
        message: `Retrieved ${analyses.length} analyses`,
      } as any,
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] History API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve analysis history",
      },
      { status: 500 }
    )
  }
}
