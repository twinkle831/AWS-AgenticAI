"""Customer and loyalty tools for the Customer Service agent."""
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


TIER_GUIDE = {
    "bronze": "Offer 5% discount on next purchase or free shipping on orders over $50.",
    "silver": "Offer 10% discount, early access to sales, or a free gift on orders over $100.",
    "gold":   "Offer 15% discount, priority support, exclusive deals, and free express shipping.",
    "standard": "Welcome offer: sign up for loyalty program to unlock bronze tier benefits.",
}


@tool("Get customer info by ID")
def get_customer_info_tool(input: str = "") -> str:
    """Get customer profile, loyalty tier, and personalized offer suggestions.

    BEHAVIOR:
    - If input is empty, returns a staff guide for all loyalty tiers with example offers.
    - If input is provided as JSON {"customer_id": "CUST-001"} or just "CUST-001",
      returns full profile for that customer.
    """
    params = _parse_input(input)
    customer_id = (
        params.get("customer_id")
        or params.get("id")
        or (input.strip().strip('"\'') if input and "{" not in input else None)
    )

    # Auto mode — return staff guide when no customer ID given
    if not customer_id:
        lines = ["Staff Loyalty Tier Guide:"]
        for tier, offer in TIER_GUIDE.items():
            lines.append(f"  {tier.upper()}: {offer}")
        lines.append(
            "\nTo look up a customer: call this tool with {\"customer_id\": \"CUST-001\"}"
        )
        return "\n".join(lines)

    item = db.get_customer(customer_id)
    if not item:
        return f"No customer found: {customer_id}"

    tier = item.get("loyalty_tier", "standard")
    prefs = item.get("preferences", {})
    offer = TIER_GUIDE.get(tier, TIER_GUIDE["standard"])
    return (
        f"Customer {customer_id}: loyalty_tier={tier}, "
        f"preferences={prefs}, contact={item.get('email', 'N/A')}.\n"
        f"Suggested offer: {offer}"
    )


@tool("Get loyalty tier for a customer")
def get_loyalty_tier_tool(input: str = "") -> str:
    """Get loyalty tier and suggested offers for a customer.

    BEHAVIOR:
    - If input is empty, returns the full tier guide for all tiers.
    - If input is provided as JSON {"customer_id": "CUST-001"} or just "CUST-001",
      returns tier for that specific customer.
    """
    params = _parse_input(input)
    customer_id = (
        params.get("customer_id")
        or params.get("id")
        or (input.strip().strip('"\'') if input and "{" not in input else None)
    )

    if not customer_id:
        lines = ["Loyalty Tier Offer Guide:"]
        for tier, offer in TIER_GUIDE.items():
            lines.append(f"  {tier.upper()}: {offer}")
        return "\n".join(lines)

    item = db.get_customer(customer_id)
    if not item:
        return f"No customer found: {customer_id}"

    tier = item.get("loyalty_tier", "standard")
    offer = TIER_GUIDE.get(tier, TIER_GUIDE["standard"])
    return (
        f"Customer {customer_id}: loyalty_tier={tier}.\n"
        f"Suggested offer: {offer}"
    )