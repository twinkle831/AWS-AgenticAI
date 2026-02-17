// ---- API response types ----

export interface InventoryItem {
  sku: string
  name: string
  quantity: number
  unit: string
  reorder_threshold: number
  category?: string
  location?: string
}

export interface EquipmentItem {
  equipment_id: string
  name?: string
  equipment_name?: string
  health_score: number
  last_maintenance?: string
  next_maintenance?: string
  location?: string
  type?: string
  status?: string
  maintenance_cost?: number
}

export interface Order {
  order_id: string
  sku: string
  quantity: number
  order_status: string
  created_at?: string
  estimated_delivery?: string
  driver?: string
  route?: string
}

export interface Customer {
  customer_id: string
  name?: string
  email?: string
  phone?: string
  loyalty_tier?: string
  preferences?: string[]
  total_purchases?: number
  sentiment_score?: number
}

export interface StaffSchedule {
  staff_id: string
  staff_name?: string
  schedule_day: string
  shift_start?: string
  shift_end?: string
  role?: string
  department?: string
}

export interface AnalyticsSummary {
  inventory: {
    total_items: number
    total_units: number
    low_stock_count: number
  }
  equipment: {
    total: number
    avg_health: number
    critical_count: number
  }
  orders: {
    total: number
    pending: number
    delivered: number
  }
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

// ---- Work Order (virtual, derived from equipment) ----

export interface WorkOrder {
  id: string
  equipment_id: string
  equipment_name: string
  priority: "critical" | "urgent" | "routine"
  status: "open" | "in_progress" | "completed"
  health_score: number
  type?: string
  location?: string
}
