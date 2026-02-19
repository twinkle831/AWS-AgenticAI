import { NextRequest, NextResponse } from "next/server"
import { queryAnalysisHistory } from "@/lib/aws-services"
import type { ShelfAnalysisResponse } from "@/lib/types"

export async function GET(request: NextRequest): Promise<NextResponse> {
  let analyses: any[] = []
  
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
      console.log("[v0] Retrieved", items.length, "items from DynamoDB")
    } catch (error) {
      console.log("[v0] DynamoDB query failed or AWS credentials not configured")
      console.log("[v0] Error:", error instanceof Error ? error.message : String(error))
      // Return empty array on error - will be handled below
      items = []
    }

    // Convert DynamoDB items to analysis objects
    analyses = items.map((item: any) => ({
      analysis_id: item.analysisId?.S || item.analysisId || "",
      shelf_location: item.shelfLocation?.S || item.shelfLocation || "",
      image_url: item.imageUrl?.S || item.imageUrl || "",
      analyzed_at: new Date(parseInt(item.analyzedAt?.N || item.analyzedAt || "0")).toISOString(),
      shelf_health_score: parseInt(item.healthScore?.N || item.healthScore || "0"),
      brands: typeof item.brands === "string" ? JSON.parse(item.brands) : Array.isArray(item.brands) ? item.brands : [],
      issues: typeof item.issues === "string" ? JSON.parse(item.issues) : Array.isArray(item.issues) ? item.issues : [],
      insights: item.insights?.S || item.insights || "",
      contractCompliance: typeof item.contractCompliance === "string" ? JSON.parse(item.contractCompliance) : Array.isArray(item.contractCompliance) ? item.contractCompliance : [],
    }))
  } catch (error) {
    console.error("[v0] History API outer error:", error)
    // Ensure we always return an array even if something unexpected happens
    analyses = []
  }

  // Always return success with data array
  return NextResponse.json(
    {
      success: true,
      data: Array.isArray(analyses) ? analyses : [],
      message: `Retrieved ${analyses.length} analyses`,
    },
    { status: 200 }
  )
}
