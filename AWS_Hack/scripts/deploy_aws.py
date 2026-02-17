"""
Create AWS resources for the Agentic Store Operations Platform:
- DynamoDB tables: inventory, orders, equipment, customers, staff-schedules
- Step Functions state machine (minimal workflow)
- IoT policy and topic (optional; requires IoT thing)
"""
from __future__ import annotations

import json
import os
import sys
from decimal import Decimal

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import boto3
from botocore.exceptions import ClientError


REGION = os.getenv("AWS_REGION", "us-east-1")
PROFILE = os.getenv("AWS_PROFILE")
STORE_ID = os.getenv("STORE_ID", "store-001")


def get_client(service: str):
    kwargs = {"region_name": REGION}
    if PROFILE:
        kwargs["profile_name"] = PROFILE
    return boto3.client(service, **kwargs)


def create_dynamodb_tables():
    """Create DynamoDB tables with minimal schema."""
    client = get_client("dynamodb")
    tables = [
        {
            "name": "store-inventory",
            "key": "sku",
            "key_type": "S",
        },
        {
            "name": "store-orders",
            "key": "order_id",
            "key_type": "S",
        },
        {
            "name": "store-equipment",
            "key": "equipment_id",
            "key_type": "S",
        },
        {
            "name": "store-customers",
            "key": "customer_id",
            "key_type": "S",
        },
        {
            "name": "store-staff-schedules",
            "key": "schedule_id",
            "key_type": "S",
        },
    ]
    for t in tables:
        try:
            client.create_table(
                TableName=t["name"],
                KeySchema=[{"AttributeName": t["key"], "KeyType": "HASH"}],
                AttributeDefinitions=[{"AttributeName": t["key"], "AttributeType": t["key_type"]}],
                BillingMode="PAY_PER_REQUEST",
            )
            print(f"Created table: {t['name']}")
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceInUseException":
                print(f"Table already exists: {t['name']}")
            else:
                raise


def create_step_functions_machine():
    """Create Step Functions state machine from minimal JSON definition."""
    client = get_client("stepfunctions")
    def_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "workflows",
        "definitions",
        "store_workflow_minimal.asl.json",
    )
    with open(def_path, "r", encoding="utf-8") as f:
        definition = f.read()
    name = "StoreOperationsWorkflow"
    role_arn = _get_or_create_sfn_role()
    try:
        client.create_state_machine(
            name=name,
            definition=definition,
            roleArn=role_arn,
        )
        print(f"Created state machine: {name}")
    except ClientError as e:
        if e.response["Error"]["Code"] == "StateMachineAlreadyExists":
            print(f"State machine already exists: {name}. Update manually if needed.")
        else:
            raise


def _get_or_create_sfn_role() -> str:
    """Get or create IAM role for Step Functions (basic execution)."""
    iam = get_client("iam")
    role_name = "StoreOperationsStepFunctionsRole"
    try:
        r = iam.get_role(RoleName=role_name)
        return r["Role"]["Arn"]
    except ClientError:
        pass
    # Create role with trust policy for Step Functions
    trust = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"Service": "states.amazonaws.com"},
                "Action": "sts:AssumeRole",
            }
        ],
    }
    iam.create_role(
        RoleName=role_name,
        AssumeRolePolicyDocument=json.dumps(trust),
        Description="Role for Store Operations Step Functions",
    )
    # No extra policy needed for minimal workflow (Pass/Succeed only)
    print("Created IAM role:", role_name)
    r = iam.get_role(RoleName=role_name)
    return r["Role"]["Arn"]


def create_iot_policy():
    """Create IoT policy allowing publish/subscribe to store topics (for simulator or things)."""
    client = get_client("iot")
    policy_name = "StoreOperationsIoTPolicy"
    doc = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": ["iot:Publish", "iot:Subscribe", "iot:Receive"],
                "Resource": [
                    f"arn:aws:iot:{REGION}:*:topic/store/{STORE_ID}/*",
                    f"arn:aws:iot:{REGION}:*:topicfilter/store/{STORE_ID}/*",
                ],
            }
        ],
    }
    try:
        client.create_policy(
            policyName=policy_name,
            policyDocument=json.dumps(doc),
        )
        print(f"Created IoT policy: {policy_name}. Attach to your IoT thing to publish telemetry.")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceAlreadyExistsException":
            print(f"IoT policy already exists: {policy_name}")
        else:
            raise


def seed_sample_data():
    """Insert sample inventory and equipment so the crew has something to work with."""
    from aws import dynamodb as db
    from config import settings

    # Ensure config uses same region/profile
    os.environ.setdefault("AWS_REGION", REGION)
    if PROFILE:
        os.environ["AWS_PROFILE"] = PROFILE

    items = [
        {"sku": "SKU-001", "name": "Widget A", "quantity": 5, "reorder_threshold": 10},
        {"sku": "SKU-002", "name": "Widget B", "quantity": 25, "reorder_threshold": 15},
        {"sku": "SKU-003", "name": "Widget C", "quantity": 3, "reorder_threshold": 8},
    ]
    for i in items:
        db.put_inventory(**i)
    print("Seeded sample inventory (3 items).")

    equipment = [
        {
            "equipment_id": "EQ-001",
            "health_score": Decimal("0.9"),
            "last_maintenance": "2025-01-15",
        },
        {
            "equipment_id": "EQ-002",
            "health_score": Decimal("0.35"),
            "last_maintenance": "2024-11-01",
        },
    ]
    table = db._resource().Table(settings.equipment_table)
    for e in equipment:
        table.put_item(Item=e)
    print("Seeded sample equipment (2 items).")

    customers = [
        {"customer_id": "CUST-001", "loyalty_tier": "gold", "email": "gold@example.com"},
        {"customer_id": "CUST-002", "loyalty_tier": "silver", "email": "silver@example.com"},
    ]
    cust_table = db._resource().Table(settings.customers_table)
    for c in customers:
        cust_table.put_item(Item=c)
    print("Seeded sample customers (2 items).")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Deploy AWS resources for Store Operations")
    parser.add_argument("--no-iot", action="store_true", help="Skip IoT policy creation")
    parser.add_argument("--seed", action="store_true", help="Seed sample inventory and equipment")
    args = parser.parse_args()

    print("Creating DynamoDB tables...")
    create_dynamodb_tables()

    print("Creating Step Functions state machine...")
    create_step_functions_machine()

    if not args.no_iot:
        print("Creating IoT policy...")
        create_iot_policy()

    if args.seed:
        print("Seeding sample data...")
        seed_sample_data()

    print("Done. Set OPENAI_API_KEY and run: python run_crew.py")


if __name__ == "__main__":
    main()
