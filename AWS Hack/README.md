# Agentic Store Operations Platform

Multi-agent system orchestrating retail store operations on AWS. Uses **CrewAI** for agents, **DynamoDB** for state, **IoT** for sensors/equipment, and **Step Functions** for workflows.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Agentic Store Operations Platform                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Inventory   │  │   Pricing     │  │ Maintenance  │  │ Customer Svc    │  │
│  │   Manager    │  │    Agent      │  │    Agent     │  │    Agent        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│         │                  │                  │                    │          │
│         └──────────────────┼──────────────────┼────────────────────┘          │
│                            │     CrewAI Crew  │                               │
│                            ▼                  ▼                               │
│  ┌──────────────┐  ┌──────────────────────────────────────────────────────┐  │
│  │  Logistics   │  │              Step Functions (Orchestration)            │  │
│  │    Agent     │  │  • Reorder workflow  • Notify workflow  • Maintenance  │  │
│  └──────┬───────┘  └──────────────────────────────────────────────────────┘  │
│         │                              │                                       │
├─────────┼──────────────────────────────┼───────────────────────────────────────┤
│         │         AWS Layer             │                                       │
│  ┌──────▼──────┐  ┌─────────────┐  ┌───▼────┐  ┌──────────┐  ┌──────────────┐  │
│  │  DynamoDB   │  │  IoT Core   │  │ Lambda │  │   SNS    │  │ EventBridge  │  │
│  │  (tables)   │  │  (sensors)  │  │ (run   │  │ (alerts, │  │ (scheduling) │  │
│  │             │  │             │  │ agents)│  │  push)   │  │              │  │
│  └─────────────┘  └─────────────┘  └────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Agents

| Agent | Role | Capabilities |
|-------|------|--------------|
| **Inventory Manager** | Stock, demand, reorder | Tracks stock, predicts demand, auto-orders |
| **Pricing Agent** | Dynamic pricing | Demand + competition-based pricing |
| **Maintenance Agent** | Equipment health | Predictive maintenance, alerts |
| **Customer Service** | Queries & loyalty | Handles queries, loyalty programs |
| **Logistics Agent** | Delivery | Optimizes delivery routes |

## Features

- **Real-time inventory tracking** via DynamoDB + optional IoT sensors
- **Predictive analytics** (demand, maintenance) via agent reasoning + optional SageMaker/ML
- **Automated reordering** triggered by thresholds and Step Functions
- **Staff scheduling optimization** (recommendations from agents)
- **Customer notifications** via SNS (SMS/email) and in-app

## Prerequisites

- **Python 3.10+**
- **AWS account** with CLI configured (`aws configure`)
- **Amazon Bedrock** — enable a model (e.g. Claude 3 Haiku) in the AWS Console once. No OpenAI key needed.

## Quick Start

See **[RUN.md](RUN.md)** for step-by-step run and demo instructions.

**TL;DR:**

```powershell
cd "c:\Users\Dhingra\AWS Hack"
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Ensure AWS is configured: aws configure (and enable Bedrock model in console)
python scripts/deploy_aws.py --seed
python api_server.py
```

Then open **http://localhost:8000** for the **demo website** (dashboard to run the crew, start workflow, view low stock).

## Project Structure

```
.
├── README.md                 # This file
├── requirements.txt
├── .env.example
├── run_crew.py               # Run CrewAI crew
├── api_server.py             # FastAPI server to trigger workflows
├── config/
│   └── settings.py           # App config
├── agents/
│   ├── __init__.py
│   ├── crew.py               # Crew definition (all agents + tasks)
│   ├── tools/                # Tools used by agents
│   └── agents.py             # Agent definitions
├── aws/
│   ├── __init__.py
│   ├── dynamodb.py           # DynamoDB tables and access
│   ├── step_functions.py     # Step Functions client
│   └── iot.py                # IoT publish/subscribe
├── workflows/
│   └── definitions/          # Step Functions state machine JSON
└── scripts/
    ├── deploy_aws.py         # Create DynamoDB, IoT, Step Functions
    └── simulate_iot_events.py
```

## AWS Resources Created

| Resource | Purpose |
|----------|---------|
| DynamoDB: `store-inventory` | SKU, quantity, thresholds, last_restock |
| DynamoDB: `store-orders` | Purchase orders, status |
| DynamoDB: `store-equipment` | Equipment ID, health, last_maintenance |
| DynamoDB: `store-customers` | Customer ID, loyalty tier, preferences |
| DynamoDB: `store-staff-schedules` | Shifts, roles |
| Step Functions: `StoreOperationsWorkflow` | Reorder + notify flow |
| IoT: Policy + topic | Equipment telemetry, inventory events |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | e.g. `us-east-1` (use same as Bedrock) |
| `AWS_PROFILE` | Optional CLI profile |
| `STORE_ID` | Default store identifier |
| `BEDROCK_MODEL_ID` | Optional; default is Claude 3 Haiku on Bedrock |

## Estimated Time

- **Setup + first run:** ~2–4 hours  
- **Full feature parity + tuning:** 24–40 hours  
- **Target:** Retail operations teams

## License

MIT
