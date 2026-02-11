"""
FastAPI server: web dashboard + API for store operations (run crew, workflow, low stock).
"""
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
os.environ['CREWAI_TELEMETRY_OPT_OUT'] = 'true'
os.environ['CREWAI_DISABLE_TELEMETRY'] = 'true'
load_dotenv()

STATIC_DIR = Path(__file__).resolve().parent / "static"

app = FastAPI(
    title="Agentic Store Operations API",
    description="Trigger crew runs and Step Functions workflows for retail operations.",
    version="1.0.0",
)

# Serve static assets (CSS, JS)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
def index():
    """Serve the demo dashboard."""
    index_path = STATIC_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Frontend not found")
    return FileResponse(index_path)


class TriggerInput(BaseModel):
    store_id: str = "store-001"
    trigger: str = "api"


class CrewRunResult(BaseModel):
    success: bool
    message: str
    output: str | None = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/run-crew", response_model=CrewRunResult)
def run_crew(body: TriggerInput | None = None):
    """Run the full CrewAI crew (inventory, pricing, maintenance, customer service, logistics). Uses AWS Bedrock."""
    from agents.crew import run_store_operations
    inputs = (body or TriggerInput()).model_dump()
    try:
        result = run_store_operations(**inputs)
        return CrewRunResult(
            success=True,
            message="Crew run completed",
            output=str(result) if result else None,
        )
    except Exception as e:
        return CrewRunResult(success=False, message=str(e), output=None)


@app.post("/workflow/start")
def start_workflow(body: TriggerInput | None = None):
    """Start the Store Operations Step Functions workflow."""
    from aws.step_functions import start_workflow as sf_start
    inputs = (body or TriggerInput()).model_dump()
    arn = sf_start(inputs)
    if not arn:
        raise HTTPException(
            status_code=503,
            detail="Could not start workflow. Is the state machine deployed?",
        )
    return {"execution_arn": arn, "input": inputs}


@app.get("/workflow/status")
def workflow_status(execution_arn: str):
    """Get status of a Step Functions execution. Pass execution_arn as query param."""
    from aws.step_functions import get_workflow_status
    return get_workflow_status(execution_arn)


@app.get("/inventory/low-stock")
def low_stock():
    """List current low-stock items (from DynamoDB)."""
    from aws.dynamodb import list_low_stock
    return {"items": list_low_stock()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
