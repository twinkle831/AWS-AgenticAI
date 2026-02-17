"""
LLM for agents: use Amazon Bedrock (AWS) so no OpenAI API key is needed.
Uses your AWS CLI credentials or env (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION).
"""
from __future__ import annotations

import os
from typing import Any

from config import settings


def get_llm():
    """
    Return the LLM for CrewAI agents. Uses Amazon Bedrock (Claude) via LangChain.
    Requires: AWS credentials (aws configure or env) and Bedrock model access in your region.
    """
    try:
        from langchain_aws.chat_models.bedrock import ChatBedrock
    except ImportError:
        raise ImportError(
            "Install langchain-aws: pip install langchain-aws langchain-core"
        ) from None

    region = settings.aws_region
    profile = settings.aws_profile
    # Claude 3 Haiku is fast and cost-effective; change if your account has different models
    model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-pro-v1:0")

    kwargs: dict[str, Any] = {
        "region_name": region,
        "model_id": model_id,
        "model_kwargs": {
            "max_tokens": 1024,
            "temperature": 0.2,
        },
    }
    if profile:
        kwargs["credentials_profile_name"] = profile

    return ChatBedrock(**kwargs)
