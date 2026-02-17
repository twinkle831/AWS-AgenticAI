"""CrewAI agent definitions for store operations."""
from crewai import Agent, LLM

from agents.tools import (
    get_inventory_tool,
    list_low_stock_tool,
    put_inventory_tool,
    create_order_tool,
    get_pricing_suggestion_tool,
    get_equipment_status_tool,
    list_equipment_tool,
    get_customer_info_tool,
    get_loyalty_tier_tool,
    get_pending_deliveries_tool,
    suggest_routes_tool,
)


def create_inventory_manager(llm):
    return Agent(
        role="Inventory Manager",
        goal="Keep stock levels optimal: track inventory, predict demand, and auto-order when items are low.",
        backstory="You are an expert at retail inventory. You use data to avoid stockouts and overstock.",
        tools=[get_inventory_tool, list_low_stock_tool, put_inventory_tool, create_order_tool],
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )


def create_pricing_agent(llm):
    return Agent(
        role="Pricing Analyst",
        goal="Set dynamic prices based on demand, competition, and stock levels to maximize revenue.",
        backstory="You specialize in retail pricing and promotions. You balance margin and turnover.",
        tools=[get_pricing_suggestion_tool, get_inventory_tool],
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )


def create_maintenance_agent(llm):
    return Agent(
        role="Maintenance Coordinator",
        goal="Ensure equipment is reliable via predictive maintenance and timely repairs.",
        backstory="You monitor equipment health and schedule maintenance before failures occur.",
        tools=[get_equipment_status_tool, list_equipment_tool],
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )


def create_customer_service_agent(llm):
    return Agent(
        role="Customer Service Representative",
        goal="Handle customer queries and loyalty programs with clarity and care.",
        backstory="You are a helpful store associate who knows loyalty tiers and can personalize responses.",
        tools=[get_customer_info_tool, get_loyalty_tier_tool],
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )


def create_logistics_agent(llm):
    return Agent(
        role="Logistics Coordinator",
        goal="Optimize delivery routes and ensure orders reach the store on time.",
        backstory="You plan efficient routes and coordinate with pending orders and drivers.",
        tools=[get_pending_deliveries_tool, suggest_routes_tool],
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )