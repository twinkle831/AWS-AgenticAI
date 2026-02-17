"""Step Functions client to start and query workflows."""
from __future__ import annotations

import json
from typing import Any

import boto3

from config import settings


def _client():
    kwargs = {"region_name": settings.aws_region}
    if settings.aws_profile:
        kwargs["profile_name"] = settings.aws_profile
    return boto3.client("stepfunctions", **kwargs)


def _get_state_machine_arn() -> str | None:
    """Resolve state machine ARN by name."""
    client = _client()
    paginator = client.get_paginator("list_state_machines")
    for page in paginator.paginate():
        for sm in page.get("stateMachines", []):
            if sm.get("name") == settings.state_machine_name:
                return sm.get("stateMachineArn")
    return None


def start_workflow(
    input_payload: dict[str, Any],
    name_prefix: str = "StoreOps",
) -> str | None:
    """
    Start the StoreOperationsWorkflow with the given input.
    Returns execution ARN if successful, else None.
    """
    arn = _get_state_machine_arn()
    if not arn:
        return None
    client = _client()
    try:
        r = client.start_execution(
            stateMachineArn=arn,
            name=f"{name_prefix}-{input_payload.get('trigger', 'manual')}-{hash(json.dumps(input_payload, sort_keys=True)) % 10**8}",
            input=json.dumps(input_payload),
        )
        return r.get("executionArn")
    except Exception:
        return None


def get_workflow_status(execution_arn: str) -> dict[str, Any]:
    """Get status and output of an execution."""
    client = _client()
    try:
        r = client.describe_execution(executionArn=execution_arn)
        out = {
            "status": r.get("status"),
            "startDate": str(r.get("startDate")),
            "stopDate": str(r.get("stopDate")) if r.get("stopDate") else None,
            "output": None,
        }
        if r.get("output"):
            try:
                out["output"] = json.loads(r["output"])
            except json.JSONDecodeError:
                out["output"] = r["output"]
        return out
    except Exception as e:
        return {"status": "UNKNOWN", "error": str(e)}
