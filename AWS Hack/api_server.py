"""
FastAPI server: web dashboard + API for store operations (run crew, workflow, low stock).
Now with CORS support and SSE streaming for real-time agent logs.
"""
import os
import sys
import io
import json
import asyncio
import threading
import time
import re
from pathlib import Path
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

os.environ['CREWAI_TELEMETRY_OPT_OUT'] = 'true'
os.environ['CREWAI_DISABLE_TELEMETRY'] = 'true'
load_dotenv()

STATIC_DIR = Path(__file__).resolve().parent / "static"

app = FastAPI(
    title="Agentic Store Operations API",
    description="Trigger crew runs and Step Functions workflows for retail operations.",
    version="2.0.0",
)

# --- CORS middleware for Next.js frontend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static assets (CSS, JS) -- keep backward compatibility
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# ---------- Models ----------

class TriggerInput(BaseModel):
    store_id: str = "store-001"
    trigger: str = "api"


class CrewRunResult(BaseModel):
    success: bool
    message: str
    output: str | None = None


# ---------- Agent name detection for log parsing ----------

AGENT_ROLES = [
    "Inventory Manager",
    "Pricing Analyst",
    "Maintenance Coordinator",
    "Customer Service Representative",
    "Logistics Coordinator",
]


def detect_agent(line: str) -> str:
    """Try to identify which agent produced a log line."""
    lower = line.lower()
    for role in AGENT_ROLES:
        if role.lower() in lower:
            return role
    # CrewAI verbose patterns
    if "working agent:" in lower:
        for role in AGENT_ROLES:
            if role.lower() in lower:
                return role
    return "System"


# ---------- Stdout capture for SSE ----------

class QueueWriter(io.TextIOBase):
    """A writer that pushes each line into an asyncio-safe queue."""

    def __init__(self, queue: asyncio.Queue, loop: asyncio.AbstractEventLoop):
        self.queue = queue
        self.loop = loop
        self._buf = ""

    def write(self, s: str) -> int:
        if not s:
            return 0
        self._buf += s
        while "\n" in self._buf:
            line, self._buf = self._buf.split("\n", 1)
            line = line.strip()
            if line:
                asyncio.run_coroutine_threadsafe(
                    self.queue.put(line), self.loop
                )
        return len(s)

    def flush(self):
        if self._buf.strip():
            asyncio.run_coroutine_threadsafe(
                self.queue.put(self._buf.strip()), self.loop
            )
            self._buf = ""


# ---------- Static frontend (backward compat) ----------

@app.get("/")
def index():
    """Serve the legacy demo dashboard."""
    index_path = STATIC_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Frontend not found")
    return FileResponse(index_path)


# ---------- Health ----------

@app.get("/health")
def health():
    return {"status": "ok"}


# ---------- Original crew run (non-streaming) ----------

@app.post("/run-crew", response_model=CrewRunResult)
def run_crew(body: TriggerInput | None = None):
    """Run the full CrewAI crew (blocking). For streaming logs, use GET /stream-crew."""
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


# ---------- SSE streaming crew run ----------

@app.get("/stream-crew")
async def stream_crew(store_id: str = "store-001", trigger: str = "api"):
    """
    Server-Sent Events endpoint that streams agent logs in real-time.
    Connect via EventSource from the frontend.
    """
    queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_event_loop()

    def run_crew_in_thread():
        """Run crew in a background thread, capturing stdout."""
        original_stdout = sys.stdout
        writer = QueueWriter(queue, loop)
        sys.stdout = writer
        try:
            from agents.crew import run_store_operations
            result = run_store_operations(store_id=store_id, trigger=trigger)
            writer.flush()
            # Send the final result
            asyncio.run_coroutine_threadsafe(
                queue.put(f"__CREW_RESULT__:{json.dumps({'success': True, 'output': str(result) if result else ''})}"),
                loop,
            )
        except Exception as e:
            writer.flush()
            asyncio.run_coroutine_threadsafe(
                queue.put(f"__CREW_RESULT__:{json.dumps({'success': False, 'error': str(e)})}"),
                loop,
            )
        finally:
            sys.stdout = original_stdout
            asyncio.run_coroutine_threadsafe(queue.put("__DONE__"), loop)

    # Start crew in background thread
    thread = threading.Thread(target=run_crew_in_thread, daemon=True)
    thread.start()

    async def event_generator():
        yield f"data: {json.dumps({'type': 'start', 'message': 'Crew run starting...', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
        while True:
            try:
                line = await asyncio.wait_for(queue.get(), timeout=120.0)
            except asyncio.TimeoutError:
                yield f"data: {json.dumps({'type': 'heartbeat', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
                continue

            if line == "__DONE__":
                yield f"event: done\ndata: {json.dumps({'type': 'done', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
                break
            elif line.startswith("__CREW_RESULT__:"):
                payload = line[len("__CREW_RESULT__:"):]
                yield f"event: result\ndata: {payload}\n\n"
            else:
                agent = detect_agent(line)
                yield f"data: {json.dumps({'type': 'log', 'agent': agent, 'message': line, 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---------- Inventory endpoints ----------

@app.get("/inventory/low-stock")
def low_stock():
    """List current low-stock items (from DynamoDB)."""
    from aws.dynamodb import list_low_stock
    return {"items": list_low_stock()}


@app.get("/inventory/all")
def all_inventory():
    """List all inventory items."""
    from aws.dynamodb import list_inventory
    return {"items": list_inventory()}


# ---------- Equipment endpoints ----------

@app.get("/equipment/all")
def all_equipment():
    """List all equipment with health scores."""
    from aws.dynamodb import list_equipment
    return {"items": list_equipment()}


# ---------- Order endpoints ----------

@app.get("/orders/all")
def all_orders(status: str | None = Query(default=None)):
    """List all orders, optionally filter by status."""
    from aws.dynamodb import get_orders
    return {"items": get_orders(status=status)}


@app.get("/orders/pending")
def pending_orders():
    """List pending orders."""
    from aws.dynamodb import get_orders
    return {"items": get_orders(status="pending")}


# ---------- Customer endpoints ----------

@app.get("/customers/{customer_id}")
def get_customer(customer_id: str):
    """Get customer profile by ID."""
    from aws.dynamodb import get_customer as db_get_customer
    item = db_get_customer(customer_id)
    if not item:
        raise HTTPException(status_code=404, detail="Customer not found")
    return item


# ---------- Workflow endpoints ----------

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
    """Get status of a Step Functions execution."""
    from aws.step_functions import get_workflow_status
    return get_workflow_status(execution_arn)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
