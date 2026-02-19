import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectTextCommand,
} from "@aws-sdk/client-rekognition"
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract"
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb"

const region = process.env.AWS_REGION || "us-east-1"

// Initialize AWS clients
export const rekognitionClient = new RekognitionClient({ region })
export const textractClient = new TextractClient({ region })
export const bedrockClient = new BedrockRuntimeClient({ region })
export const s3Client = new S3Client({ region })
export const dynamodbClient = new DynamoDBClient({ region })

// Helper function to convert image file to bytes
export async function fileToBytes(file: File | string): Promise<Uint8Array> {
  if (typeof file === "string") {
    // Handle base64 string
    const binaryString = Buffer.from(file, "base64")
    return new Uint8Array(binaryString)
  }
  const buffer = await file.arrayBuffer()
  return new Uint8Array(buffer)
}

// Detect objects and labels in shelf image using Rekognition
export async function analyzeShelfWithRekognition(imageBytes: Uint8Array) {
  try {
    const command = new DetectLabelsCommand({
      Image: {
        Bytes: imageBytes,
      },
      MaxLabels: 100,
      MinConfidence: 40,
    })

    const response = await rekognitionClient.send(command)
    return response
  } catch (error) {
    console.error("[AWS Rekognition Error]:", error)
    throw new Error(`Rekognition analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Extract text from shelf labels using Textract
export async function extractBrandLabelsWithTextract(imageBytes: Uint8Array) {
  try {
    const command = new AnalyzeDocumentCommand({
      Document: {
        Bytes: imageBytes,
      },
      FeatureTypes: ["TABLES", "FORMS"],
    })

    const response = await textractClient.send(command)
    return response
  } catch (error) {
    console.error("[AWS Textract Error]:", error)
    // Textract failures are non-critical - we can work with Rekognition alone
    return null
  }
}

// Generate insights using Claude via Bedrock
export async function generateInsightsWithBedrock(analysisData: {
  labels: string[]
  detectedBrands: Record<string, number>
  issues: string[]
}) {
  try {
    const prompt = `You are a retail analytics expert. Analyze this shelf monitoring data and provide actionable insights:

Detected Labels: ${analysisData.labels.join(", ")}
Brand Distribution: ${JSON.stringify(analysisData.detectedBrands, null, 2)}
Detected Issues: ${analysisData.issues.join(", ")}

Provide a concise analysis (2-3 sentences) on:
1. Overall shelf health
2. Brand presence effectiveness
3. Key recommendations

Be specific and actionable.`

    const command = new InvokeModelCommand({
      modelId: process.env.AWS_BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-06-01",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    const response = await bedrockClient.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    const insights = responseBody.content?.[0]?.text || "Unable to generate insights"
    return insights
  } catch (error) {
    console.error("[AWS Bedrock Error]:", error)
    // Bedrock failures are non-critical - analysis can proceed without insights
    return "Insights generation temporarily unavailable"
  }
}

// Upload image to S3
export async function uploadImageToS3(imageBytes: Uint8Array, fileName: string, storeId = "default"): Promise<string> {
  try {
    const timestamp = new Date().toISOString().split("T")[0]
    const key = `shelf-analysis/${storeId}/${timestamp}/${fileName}`

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || "shelf-share-images",
      Key: key,
      Body: imageBytes,
      ContentType: "image/jpeg",
    })

    await s3Client.send(command)
    return `s3://${process.env.AWS_S3_BUCKET || "shelf-share-images"}/${key}`
  } catch (error) {
    console.error("[AWS S3 Error]:", error)
    throw new Error(`S3 upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Store analysis in DynamoDB
export async function storeAnalysisInDynamoDB(analysis: any, storeId = "default") {
  try {
    const now = Date.now()
    const ttl = Math.floor(now / 1000) + 90 * 24 * 60 * 60 // 90 days

    const command = new PutItemCommand({
      TableName: process.env.AWS_DYNAMODB_TABLE || "ShelfAnalyses",
      Item: {
        storeId: { S: storeId },
        analyzedAt: { N: String(now) },
        analysisId: { S: analysis.analysis_id },
        shelfLocation: { S: analysis.shelf_location },
        imageUrl: { S: analysis.image_url },
        healthScore: { N: String(analysis.shelf_health_score) },
        brands: { S: JSON.stringify(analysis.brands) },
        issues: { S: JSON.stringify(analysis.issues) },
        insights: { S: analysis.insights || "" },
        contractCompliance: { S: JSON.stringify(analysis.contractCompliance || []) },
        ttl: { N: String(ttl) },
      },
    })

    await dynamodbClient.send(command)
    return true
  } catch (error) {
    console.error("[AWS DynamoDB Error]:", error)
    // DynamoDB failures are non-critical for immediate response, but should be logged
    return false
  }
}

// Query analysis history from DynamoDB
export async function queryAnalysisHistory(
  storeId = "default",
  limit = 50,
  afterTimestamp?: number
) {
  try {
    const keyConditionExpression =
      afterTimestamp && afterTimestamp > 0
        ? "storeId = :storeId AND analyzedAt < :afterTimestamp"
        : "storeId = :storeId"

    const expressionAttributeValues: any = {
      ":storeId": { S: storeId },
    }

    if (afterTimestamp && afterTimestamp > 0) {
      expressionAttributeValues[":afterTimestamp"] = { N: String(afterTimestamp) }
    }

    const command = new QueryCommand({
      TableName: process.env.AWS_DYNAMODB_TABLE || "ShelfAnalyses",
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      Limit: limit,
      ScanIndexForward: false, // Most recent first
    })

    const response = await dynamodbClient.send(command)
    return response.Items || []
  } catch (error) {
    console.error("[AWS DynamoDB Query Error]:", error)
    return []
  }
}
