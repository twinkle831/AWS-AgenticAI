"""Maintenance tools for the Maintenance Agent."""
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


@tool("List all equipment")
def list_equipment_tool(input: str = "") -> str:
    """List all store equipment with health scores and maintenance dates.
    No input required. Call with no arguments to get full equipment list.
    """
    items = db.list_equipment()
    if not items:
        return "No equipment registered."
    lines = [
        f"- {e.get('equipment_id')}: health={e.get('health_score', 'N/A')}, "
        f"last_maintenance={e.get('last_maintenance', 'N/A')}"
        for e in items
    ]
    return "Equipment:\n" + "\n".join(lines)


@tool("Get equipment status by ID")
def get_equipment_status_tool(input: str = "") -> str:
    """Get health score and last maintenance date for equipment.

    BEHAVIOR:
    - If input is empty, returns status for ALL equipment automatically.
    - If input is provided as JSON {"equipment_id": "EQ-001"} or just "EQ-001",
      returns status for that specific equipment.
    """
    params = _parse_input(input)
    equipment_id = (
        params.get("equipment_id")
        or params.get("id")
        or (input.strip().strip('"\'') if input and "{" not in input else None)
    )

    # Single equipment mode
    if equipment_id:
        return _status_for_equipment(equipment_id)

    # Auto mode — return all equipment status
    items = db.list_equipment()
    if not items:
        return "No equipment registered."

    lines = []
    for e in items:
        lines.append(_status_for_equipment(e.get("equipment_id")))
    return "Equipment Status Report:\n" + "\n".join(lines)


def _status_for_equipment(equipment_id: str) -> str:
    if not equipment_id:
        return "Error: no equipment_id provided."
    item = db.get_equipment(equipment_id)
    if not item:
        return f"No equipment found: {equipment_id}"
    health = item.get("health_score", 0)
    last = item.get("last_maintenance", "unknown")
    status = "⚠️ Schedule maintenance soon." if health < 0.5 else "✅ Status OK."
    return (
        f"Equipment {equipment_id}: health_score={health}, "
        f"last_maintenance={last}. {status}"
    )