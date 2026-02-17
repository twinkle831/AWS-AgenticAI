"""Crew definition: agents and tasks for store operations."""
from crewai import Crew, Process, Task, LLM

from config import settings
from agents.agents import (
    create_inventory_manager,
    create_pricing_agent,
    create_maintenance_agent,
    create_customer_service_agent,
    create_logistics_agent,
)


def _build_llm() -> LLM:
    """Single LLM builder used by all agents and the crew."""
    return LLM(
        model=f"bedrock/{settings.bedrock_model_id}",
        temperature=0.2,
        aws_region_name=settings.aws_region,
    )


def _inventory_task(agent) -> Task:
    return Task(
        description=(
            "Check current inventory. List any items that are at or below reorder threshold. "
            "For each low-stock item, create a purchase order (use create_order_tool) with a reasonable quantity. "
            "Summarize what you found and what orders you created."
        ),
        expected_output="A summary of low-stock items and the purchase orders created.",
        agent=agent,
    )


def _pricing_task(agent) -> Task:
    return Task(
        description=(
            "Review inventory levels. For items that are low stock, suggest whether to raise price or limit discounts. "
            "For items with high stock, suggest a promotion or discount. "
            "Output a short pricing recommendation report (SKU, current situation, recommendation)."
        ),
        expected_output="A brief pricing recommendation report by SKU.",
        agent=agent,
    )


def _maintenance_task(agent) -> Task:
    return Task(
        description=(
            "List all equipment and their health scores. Identify any with health_score below 0.5 or 50%. "
            "Recommend which equipment should get maintenance next and why."
        ),
        expected_output="A maintenance priority list with reasons.",
        agent=agent,
    )


def _customer_service_task(agent) -> Task:
    return Task(
        description=(
            "Prepare a short guide for staff: how to look up a customer by ID, check their loyalty tier, "
            "and what kind of offers to suggest for bronze vs silver vs gold tiers. "
            "You can use the customer tools with example IDs if available in the system."
        ),
        expected_output="A one-paragraph staff guide for loyalty and customer lookup.",
        agent=agent,
    )


def _logistics_task(agent) -> Task:
    return Task(
        description=(
            "Check pending deliveries (orders). Suggest an optimal route order for fulfilling them. "
            "Summarize pending orders and the suggested route."
        ),
        expected_output="A summary of pending deliveries and suggested route.",
        agent=agent,
    )


def build_store_crew() -> Crew:
    """Build the store operations crew with sequential process."""
    print("=" * 60)
    print("🏗️ Building store crew...")
    print(f"📍 Region: {settings.aws_region}")
    print(f"📍 Model: {settings.bedrock_model_id}")
    print("=" * 60)

    llm = _build_llm()
    print(f"✅ Created LLM: {llm}")

    inventory_manager = create_inventory_manager(llm)
    pricing_agent = create_pricing_agent(llm)
    maintenance_agent = create_maintenance_agent(llm)
    customer_service_agent = create_customer_service_agent(llm)
    logistics_agent = create_logistics_agent(llm)

    print("✅ All agents created")

    return Crew(
        agents=[
            inventory_manager,
            pricing_agent,
            maintenance_agent,
            customer_service_agent,
            logistics_agent,
        ],
        tasks=[
            _inventory_task(inventory_manager),
            _pricing_task(pricing_agent),
            _maintenance_task(maintenance_agent),
            _customer_service_task(customer_service_agent),
            _logistics_task(logistics_agent),
        ],
        process=Process.sequential,
        # ✅ KEY FIX: pass the same LLM as function_calling_llm
        # This forces CrewAI to use native tool/function calling
        # instead of the ReAct text loop that Nova models can't follow
        function_calling_llm=llm,
        verbose=True,
    )


def run_store_operations(**kwargs):
    """Run the full store operations crew. Pass optional inputs via kwargs."""
    crew = build_store_crew()
    return crew.kickoff(inputs=kwargs or {})