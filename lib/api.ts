import type { InventoryItem, EquipmentItem, Order, Customer } from "./types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

// ---- Health ----
export async function checkHealth(): Promise<{ status: string }> {
  return apiFetch("/health")
}

// ---- Inventory ----
export async function fetchAllInventory(): Promise<InventoryItem[]> {
  const data = await apiFetch<{ items: InventoryItem[] }>("/inventory/all")
  return data.items
}

export async function fetchLowStock(): Promise<InventoryItem[]> {
  const data = await apiFetch<{ items: InventoryItem[] }>("/inventory/low-stock")
  return data.items
}

// ---- Equipment ----
export async function fetchAllEquipment(): Promise<EquipmentItem[]> {
  const data = await apiFetch<{ items: EquipmentItem[] }>("/equipment/all")
  return data.items
}

// ---- Orders ----
export async function fetchAllOrders(status?: string): Promise<Order[]> {
  const path = status ? `/orders/all?status=${status}` : "/orders/all"
  const data = await apiFetch<{ items: Order[] }>(path)
  return data.items
}

export async function fetchPendingOrders(): Promise<Order[]> {
  const data = await apiFetch<{ items: Order[] }>("/orders/pending")
  return data.items
}

// ---- Customers ----
export async function fetchCustomer(customerId: string): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${customerId}`)
}

// ---- Crew (non-streaming) ----
export async function runCrew(storeId = "store-001") {
  return apiFetch<{ success: boolean; message: string; output?: string }>("/run-crew", {
    method: "POST",
    body: JSON.stringify({ store_id: storeId, trigger: "api" }),
  })
}

// ---- Workflow ----
export async function startWorkflow(storeId = "store-001") {
  return apiFetch<{ execution_arn: string }>("/workflow/start", {
    method: "POST",
    body: JSON.stringify({ store_id: storeId, trigger: "api" }),
  })
}

export async function getWorkflowStatus(executionArn: string) {
  return apiFetch<{ status: string }>(`/workflow/status?execution_arn=${executionArn}`)
}

// ---- SSE URL ----
export function getStreamCrewUrl(storeId = "store-001") {
  return `${API_BASE}/stream-crew?store_id=${storeId}&trigger=api`
}
