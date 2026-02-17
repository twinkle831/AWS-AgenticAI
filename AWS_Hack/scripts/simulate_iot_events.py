"""
Simulate IoT events (inventory level updates, equipment telemetry) by publishing
to AWS IoT Core. Requires an IoT thing and policy that allows publish to store/<store_id>/*.
"""
from __future__ import annotations

import os
import random
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from aws.iot import publish_inventory_event, publish_equipment_telemetry
from config import settings


def main():
    print("Simulating IoT events (Ctrl+C to stop)...")
    equipment_ids = ["EQ-001", "EQ-002"]
    skus = ["SKU-001", "SKU-002", "SKU-003"]
    for i in range(10):
        # Random inventory level update
        sku = random.choice(skus)
        qty = random.randint(1, 50)
        ok = publish_inventory_event(sku, qty, "level_update")
        print(f"Inventory event: {sku} -> {qty}  (published={ok})")

        # Random equipment telemetry
        eid = random.choice(equipment_ids)
        health = round(random.uniform(0.2, 1.0), 2)
        ok = publish_equipment_telemetry(eid, health, {"temp": random.randint(18, 28)})
        print(f"Equipment event: {eid} health={health}  (published={ok})")

        time.sleep(2)
    print("Simulation done.")


if __name__ == "__main__":
    main()
