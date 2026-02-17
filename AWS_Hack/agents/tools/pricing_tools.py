"""Pricing tools for the Pricing Agent."""
from crewai.tools import tool
import json

from aws import dynamodb as db


def _parse_input(raw) -> dict:
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
    for part in raw.replace(",", " ").split():
        if "=" in part:
            key, _, val = part.partition("=")
            result[key.strip().strip('"\'}')] = val.strip().strip('"\'')
    return result


@tool("Get pricing suggestion for a SKU")
def get_pricing_suggestion_tool(input: str = "") -> str:
    """Get pricing suggestions based on inventory levels for all low-stock items or a specific SKU.

    BEHAVIOR:
    - If input is empty or missing, automatically fetches ALL inventory items
      and returns pricing suggestions for each one.
    - If input is provided as JSON {"sku": "SKU-001"} or just "SKU-001",
      returns suggestion for that specific SKU only.

    Calling with no input returns a full pricing report automatically.
    """
    params = _parse_input(input)
    sku = params.get("sku") or (input.strip().strip('"\'') if input and "{" not in input else None)

    # Single SKU mode
    if sku:
        return _suggest_for_sku(sku)

    # Auto mode — fetch all inventory and report on everything
    items = db.list_inventory() if hasattr(db, "list_inventory") else []

    # Fallback: use low stock items if list_inventory not available
    if not items:
        items = db.list_low_stock()

    if not items:
        return "No inventory data available for pricing suggestions."

    lines = []
    for item in items:
        lines.append(_suggest_for_sku(item.get("sku")))

    return "Pricing Recommendation Report:\n" + "\n".join(lines)


def _suggest_for_sku(sku: str) -> str:
    if not sku:
        return "Error: no SKU provided."
    item = db.get_inventory(sku)
    if not item:
        return f"SKU {sku}: No inventory data found."
    q = item.get("quantity", 0)
    thresh = item.get("reorder_threshold", 10)
    name = item.get("name", sku)
    if q <= thresh:
        return (
            f"SKU {sku} ({name}): LOW STOCK ({q} units, threshold {thresh}). "
            "Recommendation: Raise price or limit discounts to preserve margin."
        )
    if q > thresh * 3:
        return (
            f"SKU {sku} ({name}): HIGH STOCK ({q} units, threshold {thresh}). "
            "Recommendation: Run promotion or temporary discount to move inventory."
        )
    return (
        f"SKU {sku} ({name}): NORMAL STOCK ({q} units, threshold {thresh}). "
        "Recommendation: Maintain current pricing; monitor demand."
    )