"""DynamoDB tables and access for store operations."""
from __future__ import annotations

import os
from decimal import Decimal
from typing import Any

import boto3
from botocore.exceptions import ClientError

from config import settings


def _client():
    kwargs = {"region_name": settings.aws_region}
    if settings.aws_profile:
        kwargs["profile_name"] = settings.aws_profile
    return boto3.client("dynamodb", **kwargs)


def _resource():
    kwargs = {"region_name": settings.aws_region}
    if settings.aws_profile:
        kwargs["profile_name"] = settings.aws_profile
    return boto3.resource("dynamodb", **kwargs)


# ---------- Inventory ----------


def get_inventory(sku: str) -> dict[str, Any] | None:
    """Get one inventory item by SKU."""
    table = _resource().Table(settings.inventory_table)
    try:
        r = table.get_item(Key={"sku": sku})
        return r.get("Item")
    except ClientError:
        return None


def put_inventory(
    sku: str,
    name: str,
    quantity: int,
    unit: str = "units",
    reorder_threshold: int = 10,
    **kwargs: Any,
) -> None:
    """Put or update an inventory item."""
    table = _resource().Table(settings.inventory_table)
    item = {
        "sku": sku,
        "name": name,
        "quantity": quantity,
        "unit": unit,
        "reorder_threshold": reorder_threshold,
        **kwargs,
    }
    table.put_item(Item=item)


def list_inventory() -> list[dict[str, Any]]:
    """Scan inventory table (use sparingly; for small datasets)."""
    table = _resource().Table(settings.inventory_table)
    return list(table.scan().get("Items", []))


def list_low_stock() -> list[dict[str, Any]]:
    """Return items where quantity <= reorder_threshold. Requires GSI or scan."""
    items = list_inventory()
    return [
        i
        for i in items
        if i.get("quantity", 0) <= i.get("reorder_threshold", 0)
    ]


# ---------- Orders ----------


def get_orders(status: str | None = None) -> list[dict[str, Any]]:
    """List orders; optionally filter by status."""
    table = _resource().Table(settings.orders_table)
    scan_kw: dict[str, Any] = {}
    if status:
        scan_kw["FilterExpression"] = "order_status = :s"
        scan_kw["ExpressionAttributeValues"] = {":s": status}
    items = table.scan(**scan_kw).get("Items", [])
    return items


def put_order(
    order_id: str,
    sku: str,
    quantity: int,
    status: str = "pending",
    **kwargs: Any,
) -> None:
    """Create or update a purchase order."""
    table = _resource().Table(settings.orders_table)
    table.put_item(
        Item={
            "order_id": order_id,
            "sku": sku,
            "quantity": quantity,
            "order_status": status,
            **kwargs,
        }
    )


def get_order(order_id: str) -> dict[str, Any] | None:
    """Get a single order by order_id."""
    table = _resource().Table(settings.orders_table)
    r = table.get_item(Key={"order_id": order_id})
    return r.get("Item")


# ---------- Equipment (maintenance) ----------


def get_equipment(equipment_id: str) -> dict[str, Any] | None:
    """Get equipment record."""
    table = _resource().Table(settings.equipment_table)
    r = table.get_item(Key={"equipment_id": equipment_id})
    return r.get("Item")


def list_equipment() -> list[dict[str, Any]]:
    """List all equipment."""
    table = _resource().Table(settings.equipment_table)
    return list(table.scan().get("Items", []))


def update_equipment_health(
    equipment_id: str,
    health_score: float,
    last_maintenance: str | None = None,
    **kwargs: Any,
) -> None:
    """Update equipment health (from IoT or maintenance agent)."""
    table = _resource().Table(settings.equipment_table)
    key = {"equipment_id": equipment_id}
    upd = "set health_score = :h"
    # DynamoDB requires Decimal for numeric types (not float)
    vals: dict[str, Any] = {":h": Decimal(str(health_score))}
    if last_maintenance:
        upd += ", last_maintenance = :m"
        vals[":m"] = last_maintenance
    for k, v in kwargs.items():
        # Convert floats in extra attributes as well
        if isinstance(v, float):
            v = Decimal(str(v))
        key_name = f":{k}"
        upd += f", {k} = {key_name}"
        vals[key_name] = v
    table.update_item(
        Key=key,
        UpdateExpression=upd,
        ExpressionAttributeValues=vals,
    )


# ---------- Customers (for Customer Service agent) ----------


def get_customer(customer_id: str) -> dict[str, Any] | None:
    """Get customer by ID."""
    table = _resource().Table(settings.customers_table)
    r = table.get_item(Key={"customer_id": customer_id})
    return r.get("Item")


def get_customers_table():
    """Return customers table resource for agent tools that need it."""
    return _resource().Table(settings.customers_table)


# ---------- Staff schedules ----------


def get_staff_schedules_table():
    """Return staff schedules table for scheduling agent logic."""
    return _resource().Table(settings.staff_schedules_table)


def list_staff_schedules(day: str | None = None) -> list[dict[str, Any]]:
    """List staff schedule entries; optional filter by day."""
    table = _resource().Table(settings.staff_schedules_table)
    kw: dict[str, Any] = {}
    if day:
        kw["FilterExpression"] = "schedule_day = :d"
        kw["ExpressionAttributeValues"] = {":d": day}
    return list(table.scan(**kw).get("Items", []))
