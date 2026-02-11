"""Inventory tools for the Inventory Manager agent."""
from crewai.tools import tool
import json
import uuid

from aws import dynamodb as db


def _parse_input(raw) -> dict:
    """Parse tool input from JSON string, dict, or key=value pairs."""
    if not raw:
        return {}
    if isinstance(raw, dict):
        return raw
    raw = str(raw).strip()
    if not raw:
        return {}
    try:
        result = json.loads(raw)
        if isinstance(result, dict):
            return result
    except (json.JSONDecodeError, ValueError):
        pass
    result = {}
    parts = raw.replace(",", " ").split()
    for part in parts:
        if "=" in part:
            key, _, val = part.partition("=")
            key = key.strip().strip('"\'')
            val = val.strip().strip('"\'')
            try:
                val = int(val)
            except ValueError:
                try:
                    val = float(val)
                except ValueError:
                    pass
            result[key] = val
    return result


@tool("Get inventory for a SKU")
def get_inventory_tool(input: str = "") -> str:
    """Get current stock quantity and details for a product SKU.
    Pass input as JSON: {"sku": "SKU-001"}
    """
    params = _parse_input(input)
    sku = params.get("sku") or str(input).strip().strip('"\'')
    if not sku:
        return "Error: provide sku. Example: {\"sku\": \"SKU-001\"}"
    item = db.get_inventory(sku)
    if not item:
        return f"No inventory found for SKU: {sku}"
    return (
        f"SKU: {item.get('sku')}, Name: {item.get('name')}, "
        f"Quantity: {item.get('quantity')} {item.get('unit', 'units')}, "
        f"Reorder threshold: {item.get('reorder_threshold')}"
    )


@tool("List items with low stock")
def list_low_stock_tool(input: str = "") -> str:
    """List all products at or below their reorder threshold. No input required."""
    items = db.list_low_stock()
    if not items:
        return "No low-stock items."
    lines = [
        f"- {i.get('sku')} ({i.get('name')}): {i.get('quantity')} "
        f"(threshold {i.get('reorder_threshold')})"
        for i in items
    ]
    return "Low stock:\n" + "\n".join(lines)


@tool("Update inventory quantity")
def put_inventory_tool(input: str = "") -> str:
    """Update or create an inventory item.
    Pass input as JSON: {"sku": "SKU-001", "name": "Widget A", "quantity": 100, "reorder_threshold": 10}
    """
    params = _parse_input(input)
    sku = params.get("sku")
    name = params.get("name")
    quantity = params.get("quantity")
    reorder_threshold = params.get("reorder_threshold", 10)
    if not sku or not name or quantity is None:
        return (
            "Error: provide sku, name, quantity. "
            "Example: {\"sku\": \"SKU-001\", \"name\": \"Widget A\", \"quantity\": 100}"
        )
    db.put_inventory(sku=sku, name=name, quantity=int(quantity), reorder_threshold=int(reorder_threshold))
    return f"Updated {sku} ({name}): quantity={quantity}, reorder_threshold={reorder_threshold}"


@tool("Create a purchase order")
def create_order_tool(input: str = "") -> str:
    """Create purchase orders for low-stock items.

    BEHAVIOR:
    - If input is provided as JSON {"sku": "SKU-001", "quantity": 50}, creates one order.
    - If input is empty or missing, automatically fetches ALL low-stock items
      and creates a purchase order for each one (reorders up to 2x the threshold).

    Use this tool to reorder low-stock items. You do not need to pass arguments —
    calling it with no input will handle everything automatically.
    """
    params = _parse_input(input)
    sku = params.get("sku")
    quantity = params.get("quantity")

    # If specific sku+quantity provided, create single order
    if sku and quantity is not None:
        order_id = f"PO-{sku}-{uuid.uuid4().hex[:8]}"
        db.put_order(order_id=order_id, sku=sku, quantity=int(quantity), status="pending")
        return f"Created order {order_id} for SKU {sku}, quantity {quantity}."

    # Otherwise auto-fetch low stock and create orders for all of them
    items = db.list_low_stock()
    if not items:
        return "No low-stock items found. No orders created."

    results = []
    for item in items:
        item_sku = item.get("sku")
        threshold = item.get("reorder_threshold", 10)
        # Order enough to restock to 2x the threshold
        reorder_qty = threshold * 2
        order_id = f"PO-{item_sku}-{uuid.uuid4().hex[:8]}"
        db.put_order(order_id=order_id, sku=item_sku, quantity=reorder_qty, status="pending")
        results.append(
            f"  - {order_id}: {item_sku} ({item.get('name')}), qty={reorder_qty}"
        )

    return "Created purchase orders for all low-stock items:\n" + "\n".join(results)