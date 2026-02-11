"""Logistics tools for the Logistics Agent."""
from crewai.tools import tool

from aws import dynamodb as db


@tool("Get pending deliveries (orders)")
def get_pending_deliveries_tool(input: str = "") -> str:
    """List all pending purchase orders that need delivery.
    No input required. Call with no arguments to get full pending deliveries list.
    """
    orders = db.get_orders(status="pending")
    if not orders:
        return "No pending deliveries."
    lines = [
        f"- {o.get('order_id')}: SKU {o.get('sku')}, qty {o.get('quantity')}"
        for o in orders
    ]
    return "Pending deliveries:\n" + "\n".join(lines)


@tool("Suggest delivery route summary")
def suggest_routes_tool(input: str = "") -> str:
    """Suggest an optimized delivery route for all pending orders.
    No input required. Automatically fetches pending orders and suggests route sequence.
    """
    orders = db.get_orders(status="pending")
    if not orders:
        return "No pending deliveries; no route needed."
    order_ids = [o.get("order_id") for o in orders]
    route = " -> ".join(order_ids[:5])
    suffix = " -> ..." if len(order_ids) > 5 else ""
    return (
        f"Suggested delivery route ({len(order_ids)} stops):\n"
        f"Sequence: {route}{suffix}\n"
        f"Tip: Group by SKU supplier location to minimize travel distance."
    )