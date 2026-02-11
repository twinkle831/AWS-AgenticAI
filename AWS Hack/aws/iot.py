"""AWS IoT Core publish for equipment telemetry and inventory events."""
from __future__ import annotations

import json
from typing import Any

import boto3

from config import settings


def _client():
    kwargs = {"region_name": settings.aws_region}
    if settings.aws_profile:
        kwargs["profile_name"] = settings.aws_profile
    return boto3.client("iot-data", **kwargs)


def publish_iot_event(
    topic: str,
    payload: dict[str, Any],
) -> bool:
    """
    Publish a message to an IoT topic (e.g. store/001/inventory or store/001/equipment).
    Requires IoT thing with publish permission on that topic.
    """
    try:
        _client().publish(
            topic=topic,
            qos=1,
            payload=json.dumps(payload),
        )
        return True
    except Exception:
        return False


def publish_inventory_event(sku: str, quantity: int, event: str = "level_update") -> bool:
    """Convenience: publish inventory level to store/{store_id}/inventory."""
    topic = f"store/{settings.store_id}/inventory"
    return publish_iot_event(
        topic,
        {"sku": sku, "quantity": quantity, "event": event},
    )


def publish_equipment_telemetry(
    equipment_id: str,
    health_score: float,
    metrics: dict[str, Any] | None = None,
) -> bool:
    """Convenience: publish equipment telemetry to store/{store_id}/equipment."""
    topic = f"store/{settings.store_id}/equipment"
    payload = {"equipment_id": equipment_id, "health_score": health_score}
    if metrics:
        payload["metrics"] = metrics
    return publish_iot_event(topic, payload)
