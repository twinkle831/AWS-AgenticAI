// ---- API response types ----

export interface InventoryItem {
  sku: string
  name: string
  quantity: number
  unit: string
  reorder_threshold: number
}

export interface EquipmentItem {
  equipment_id: string
  name?: string
  equipment_name?: string
  health_score: number
  last_maintenance?: string
  location?: string
  type?: string
}

export interface Order {
  order_id: string
  sku: string
  quantity: number
  order_status: string
  created_at?: string
}

export interface Customer {
  customer_id: string
  name?: string
  email?: string
  phone?: string
  loyalty_tier?: string
  preferences?: string[]
  total_purchases?: number
}

export interface WorkflowStatus {
  execution_arn: string
  status: string
  input?: string
  output?: string
}

// ---- SSE log types ----

export type AgentRole =
  | "Inventory Manager"
  | "Pricing Analyst"
  | "Maintenance Coordinator"
  | "Customer Service Representative"
  | "Logistics Coordinator"
  | "System"

export interface LogEntry {
  id: string
  type: "log" | "start" | "heartbeat" | "done"
  agent: AgentRole
  message: string
  timestamp: string
}

export interface CrewResult {
  success: boolean
  output?: string
  error?: string
}

// ---- Shared UI types ----

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral"

// ---- Shelf Share Monitor types ----

export interface BrandOccupancy {
  brand_name: string
  percentage: number
  color: string
}

export interface ShelfIssue {
  type: "empty_spot" | "misplaced_product" | "damaged_item"
  severity: "low" | "medium" | "high"
  location: string
  description: string
}

export interface ShelfAnalysis {
  analysis_id: string
  shelf_location: string
  image_url: string
  analyzed_at: string
  shelf_health_score: number
  brands: BrandOccupancy[]
  issues: ShelfIssue[]
}
