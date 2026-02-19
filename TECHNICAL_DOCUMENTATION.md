# AWS-AgenticAI: Complete Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Use Case & Problem Statement](#use-case--problem-statement)
3. [AWS Bedrock Agents System](#aws-bedrock-agents-system)
4. [Voice Feature Implementation](#voice-feature-implementation)
5. [Shelf Monitor Feature](#shelf-monitor-feature)
6. [AWS Services & Integration Details](#aws-services--integration-details)
7. [System Architecture](#system-architecture)
8. [Deployment & Configuration](#deployment--configuration)

---

## Project Overview

**Project Name:** AWS-AgenticAI (StoreOps AI v2.0)

**Description:** An intelligent retail store operations platform powered by AWS Bedrock agents. The system automates critical business functions through AI-driven agents that collaborate to optimize inventory, pricing, maintenance, customer service, and logistics.

**Key Features:**
- Multi-agent orchestration for autonomous decision-making
- Real-time voice interaction with AI agents
- Computer vision-based shelf monitoring and brand analysis
- Dynamic pricing and inventory optimization
- Predictive maintenance scheduling
- Customer loyalty program management
- Route optimization for delivery logistics

**Tech Stack:**
- **Frontend:** Next.js 15, React 19, Tailwind CSS 4
- **Backend:** FastAPI (Python), CrewAI
- **AI/ML:** AWS Bedrock (Claude/Amazon Nova), LangChain
- **Vision:** Amazon Rekognition, Amazon Textract
- **Data:** DynamoDB, Amazon S3
- **Orchestration:** AWS Step Functions, AWS IoT Core
- **Voice:** Web Speech API (browser-native)

---

## Use Case & Problem Statement

### Business Problem

Modern retail stores face critical operational challenges:

1. **Inventory Management:** Manual stock tracking leads to stockouts (lost sales) or overstock (wasted capital)
2. **Dynamic Pricing:** Manual pricing cannot respond to real-time market conditions, competition, and demand
3. **Equipment Maintenance:** Reactive maintenance causes unexpected downtime and emergency repairs
4. **Customer Experience:** Loyalty programs lack personalization; customers aren't recognized
5. **Logistics:** Manual delivery routing is inefficient, leading to late deliveries and high fuel costs
6. **Shelf Compliance:** Brand dominance and empty shelves violate supplier contracts

### Solution

An **AI-powered agent system** that autonomously manages store operations by:
- Continuously monitoring inventory and predicting demand
- Automatically adjusting prices based on market conditions
- Scheduling maintenance before equipment fails
- Personalizing customer offers based on loyalty tier
- Optimizing delivery routes in real-time
- Analyzing shelf images to ensure brand compliance and optimize space

### Expected ROI

- **Inventory:** 15-20% reduction in stockouts and overstock
- **Pricing:** 5-8% revenue increase through dynamic pricing
- **Maintenance:** 30% reduction in unplanned downtime
- **Customer Retention:** 10-15% increase in repeat customers
- **Logistics:** 20% reduction in delivery costs
- **Compliance:** 100% shelf audit compliance

---

## AWS Bedrock Agents System

### Overview

The system uses **AWS Bedrock** (a managed service for foundation models) with **CrewAI** (a Python multi-agent orchestration framework) to create a team of specialized AI agents. These agents collaborate using a **sequential process** to solve complex business problems.

### Architecture: How Agents Work

#### 1. **Bedrock Foundation Model Integration**

```python
# From: AWS_Hack/agents/llm.py

from langchain_aws.chat_models.bedrock import ChatBedrock

def get_llm():
    """
    Initialize Bedrock LLM with AWS credentials.
    Model: amazon.nova-pro-v1:0 or anthropic.claude-3-sonnet-20240229-v1:0
    """
    return ChatBedrock(
        region_name=settings.aws_region,        # e.g., "us-east-1"
        model_id="amazon.nova-pro-v1:0",        # Fast & cost-effective
        model_kwargs={
            "max_tokens": 1024,                  # Response length limit
            "temperature": 0.2,                  # Deterministic (low randomness)
        }
    )
```

**Why Bedrock?**
- ✅ No API keys needed (uses AWS IAM credentials)
- ✅ Cost-effective with per-token pricing
- ✅ Access to multiple models (Claude, Amazon Nova, etc.)
- ✅ Built-in security & compliance
- ✅ Enterprise-grade support

**Models Available:**
- `amazon.nova-pro-v1:0` - Fast, cost-effective (DEFAULT)
- `anthropic.claude-3-sonnet-20240229-v1:0` - More capable, higher cost
- `anthropic.claude-opus` - Most powerful (optional)

#### 2. **Agent Definitions**

Five specialized agents handle different domains:

```python
# From: AWS_Hack/agents/agents.py

AGENTS = [
    {
        name: "Inventory Manager",
        role: "Keep stock levels optimal",
        goal: "Track inventory, predict demand, auto-order when items are low",
        tools: [
            get_inventory_tool,
            list_low_stock_tool,
            put_inventory_tool,
            create_order_tool,
        ]
    },
    {
        name: "Pricing Analyst",
        role: "Set dynamic prices",
        goal: "Maximize revenue based on demand, competition, stock levels",
        tools: [
            get_pricing_suggestion_tool,
            get_inventory_tool,
        ]
    },
    {
        name: "Maintenance Coordinator",
        role: "Ensure equipment reliability",
        goal: "Predictive maintenance & timely repairs",
        tools: [
            get_equipment_status_tool,
            list_equipment_tool,
        ]
    },
    {
        name: "Customer Service Representative",
        role: "Handle customer queries & loyalty",
        goal: "Personalized service based on loyalty tier",
        tools: [
            get_customer_info_tool,
            get_loyalty_tier_tool,
        ]
    },
    {
        name: "Logistics Coordinator",
        role: "Optimize delivery routes",
        goal: "Ensure orders reach the store on time",
        tools: [
            get_pending_deliveries_tool,
            suggest_routes_tool,
        ]
    }
]
```

#### 3. **Task Orchestration (Sequential Process)**

Each agent has a **task** that it executes sequentially:

```python
# From: AWS_Hack/agents/crew.py

crew = Crew(
    agents=[
        inventory_manager,      # Executes first
        pricing_agent,          # Executes second (uses inventory data)
        maintenance_agent,      # Executes third
        customer_service_agent, # Executes fourth
        logistics_agent,        # Executes fifth
    ],
    tasks=[
        Task(inventory_manager, "Check low stock and create orders"),
        Task(pricing_agent, "Suggest prices based on inventory"),
        Task(maintenance_agent, "Schedule maintenance"),
        Task(customer_service_agent, "Prepare loyalty guide"),
        Task(logistics_agent, "Optimize delivery routes"),
    ],
    process=Process.sequential,  # Sequential execution
    function_calling_llm=llm,    # Native tool calling (critical for Nova models)
    verbose=True,
)
```

**Execution Flow:**
1. **Inventory Manager** → Queries DynamoDB, lists low-stock items, creates purchase orders
2. **Pricing Analyst** → Receives inventory context, suggests dynamic price adjustments
3. **Maintenance Coordinator** → Checks equipment health, schedules predictive maintenance
4. **Customer Service** → Looks up customer loyalty tiers, prepares personalized offers
5. **Logistics Coordinator** → Analyzes pending deliveries, suggests optimal route

**Result:** Each agent's output becomes context for the next agent → collaborative intelligence

#### 4. **Tool Calling Mechanism**

Tools are Python functions that agents can invoke:

```python
# From: AWS_Hack/agents/tools/inventory_tools.py

@tool
def get_inventory_tool(sku: str) -> dict:
    """Get current inventory for a SKU."""
    from aws.dynamodb import get_inventory
    return get_inventory(sku)

@tool
def list_low_stock_tool() -> list:
    """List all items below reorder threshold."""
    from aws.dynamodb import list_low_stock
    return list_low_stock()

@tool
def create_order_tool(sku: str, quantity: int) -> dict:
    """Create a purchase order."""
    from aws.dynamodb import put_order
    order_id = f"order-{datetime.now().timestamp()}"
    put_order(order_id, sku, quantity, status="pending")
    return {"order_id": order_id, "status": "pending"}
```

**How Tool Calling Works:**

1. Agent receives a task
2. LLM (Bedrock) analyzes the task and decides which tool(s) to call
3. Bedrock returns tool name + parameters
4. CrewAI executes the tool (DynamoDB query, calculation, etc.)
5. Result is passed back to the agent
6. Agent uses the result to continue reasoning
7. Process repeats until task is complete

**Example Agent Thought Process:**

```
Agent: "Inventory Manager"
Task: "Check low stock and create orders"

Agent Thinking:
1. I need to find items with low stock
   → Call: list_low_stock_tool()
   
2. Got results: [SKU-001 has 3 units, threshold is 10]
   → This is critical!
   
3. I should create a purchase order for SKU-001
   → Call: create_order_tool(sku="SKU-001", quantity=50)
   
4. Order created: order-12345
   → Task complete, summarize findings
```

#### 5. **Key Design Decision: Function Calling LLM**

```python
# CRITICAL: Pass same LLM as function_calling_llm
crew = Crew(
    agents=[...],
    tasks=[...],
    process=Process.sequential,
    function_calling_llm=llm,  # ← Essential for Amazon Nova
)
```

**Why?** 
- Amazon Nova models don't support ReAct (text-based reasoning loop)
- They require **native function calling** for tool invocation
- By setting `function_calling_llm=llm`, we force CrewAI to use structured tool calling
- This makes the agents much faster and more reliable

### 6. **Real-Time Execution & Streaming**

#### FastAPI SSE Streaming Endpoint

```python
# From: AWS_Hack/api_server.py - /stream-crew endpoint

@app.get("/stream-crew")
async def stream_crew(store_id: str = "store-001", trigger: str = "api"):
    """
    Server-Sent Events (SSE) endpoint for real-time agent logs.
    Frontend connects via EventSource and receives live updates.
    """
    
    # Step 1: Create async queue for log streaming
    queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_event_loop()
    
    # Step 2: Run crew in background thread
    def run_crew_in_thread():
        # Capture stdout → queue
        original_stdout = sys.stdout
        writer = QueueWriter(queue, loop)
        sys.stdout = writer
        
        try:
            # Execute all agents sequentially
            result = run_store_operations(store_id=store_id, trigger=trigger)
            
            # Send final result
            asyncio.run_coroutine_threadsafe(
                queue.put(f"__CREW_RESULT__:{json.dumps({...})}"),
                loop,
            )
        finally:
            sys.stdout = original_stdout
    
    # Step 3: Stream events to client
    async def event_generator():
        while True:
            line = await asyncio.wait_for(queue.get(), timeout=120.0)
            
            if line == "__DONE__":
                yield f"event: done\ndata: {...}\n\n"
                break
            else:
                agent = detect_agent(line)  # Parse which agent wrote this
                yield f"data: {json.dumps({
                    'type': 'log',
                    'agent': agent,
                    'message': line,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                })}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )
```

**Frontend Connection:**

```typescript
// From: lib/commander/use-commander.ts

const eventSource = new EventSource("/stream-crew");

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'log') {
        // Display: "[Inventory Manager] Listed 5 low-stock items"
        console.log(`[${data.agent}] ${data.message}`);
    }
};

eventSource.addEventListener('done', () => {
    eventSource.close();
});
```

**Benefits:**
- ✅ Real-time log streaming (no 30-second wait)
- ✅ User sees each agent working sequentially
- ✅ Live transcript updates in Command Center
- ✅ Agent constellation shows real-time status

---

## Voice Feature Implementation

### Architecture Overview

The voice system enables users to **speak commands** to AI agents and **hear responses** using browser-native APIs.

### 1. **Voice Input: Speech Recognition**

```typescript
// From: lib/commander/use-voice.ts

export function useVoice() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: "",
    interimTranscript: "",
    isSupported: false,
    isMuted: false,
  });

  useEffect(() => {
    // Check browser support for Web Speech API
    const SpeechRecognition = window.SpeechRecognition || 
                              window.webkitSpeechRecognition;
    const supported = !!SpeechRecognition && !!window.speechSynthesis;
    setState(s => ({ ...s, isSupported: supported }));
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || 
                              window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configuration
    recognition.continuous = false;      // Stop after user pauses
    recognition.interimResults = true;   // Show live typing as user speaks
    recognition.lang = "en-US";
    
    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      
      // Process recognized segments
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          final += transcript;        // Confirmed by user silence
        } else {
          interim += transcript;      // Still speaking/thinking
        }
      }
      
      setState(s => ({
        ...s,
        transcript: final || s.transcript,
        interimTranscript: interim,
      }));
    };
    
    recognition.onend = () => {
      setState(s => ({ ...s, isListening: false }));
      // Callback with final transcript
      if (onFinalTranscriptRef.current) {
        onFinalTranscriptRef.current(transcript);
      }
    };
    
    recognition.start();
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported,
  };
}
```

**Speech Recognition Lifecycle:**

```
User speaks: "What's our inventory status?"
         │
         ▼
Browser SpeechRecognition API starts listening
         │
    ┌────────────────────────┐
    │ Interim results as     │
    │ user speaks:           │
    │ "What's" →             │
    │ "What's our" →         │
    │ "What's our inv..." → │
    │ "What's our inventory"│
    │ (updates in real-time) │
    └────────────────────────┘
         │
    User finishes speaking / pauses for 1 second
         │
         ▼
    Recognition marked as FINAL
    ├─ transcript: "What's our inventory status?"
    ├─ confidence: 0.98
    └─ callback triggered
         │
         ▼
    Stop listening
    └─ isListening = false
```

### 2. **Transcript Processing & Agent Routing**

```typescript
// From: lib/commander/use-commander.ts

const agentBrain = useAgentBrain();
const voice = useVoice();

const handleVoiceCommand = async (transcript: string) => {
  // Route command to appropriate agent(s)
  const routing = agentBrain.routeCommand(transcript);
  
  // Examples:
  // "Check inventory" → routes to Inventory Manager
  // "What's our revenue?" → routes to Pricing Analyst
  // "Is equipment working?" → routes to Maintenance Coordinator
  
  // Trigger agent execution with SSE streaming
  const eventSource = new EventSource(
    `/stream-crew?store_id=${storeId}`
  );
  
  eventSource.onmessage = (event) => {
    const { agent, message } = JSON.parse(event.data);
    
    // Update command center UI
    updateTranscript(agent, message);
    
    // Speak agent response
    voice.speak(message, agent);
  };
};
```

### 3. **Voice Output: Text-to-Speech (TTS)**

```typescript
// From: lib/commander/use-voice.ts

const synthRef = useRef<SpeechSynthesis | null>(null);
const speechQueueRef = useRef<{ text: string; agentId: AgentId }[]>([]);

const speak = useCallback((text: string, agentId: AgentId) => {
  // Queue the speech item
  speechQueueRef.current.push({ text, agentId });
  
  if (!isSpeakingRef.current) {
    processQueue();
  }
}, []);

const processQueue = useCallback(() => {
  if (isSpeakingRef.current || speechQueueRef.current.length === 0) 
    return;

  const item = speechQueueRef.current.shift();
  isSpeakingRef.current = true;

  // Check mute status
  if (isMutedRef.current) {
    // Muted: simulate speech duration
    const duration = Math.min(item.text.length * 30, 4000);
    setTimeout(() => {
      isSpeakingRef.current = false;
      if (speechQueueRef.current.length > 0) {
        processQueue();
      }
    }, duration);
    return;
  }

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(item.text);
  
  // Agent-specific voice characteristics
  const agent = AGENTS[item.agentId];
  utterance.pitch = agent.voicePitch;    // e.g., 1.2 for higher voice
  utterance.rate = agent.voiceRate;      // e.g., 1.0 for normal speed
  utterance.volume = 0.8;
  
  // Assign voice
  const voices = synthRef.current.getVoices();
  if (voices.length > 0) {
    const agentIndex = Object.keys(AGENTS).indexOf(item.agentId);
    const voiceIndex = agentIndex % voices.length;
    utterance.voice = voices[voiceIndex];  // Round-robin voice assignment
  }

  // Handle completion
  utterance.onend = () => {
    isSpeakingRef.current = false;
    if (speechQueueRef.current.length > 0) {
      processQueue();
    }
  };

  synthRef.current.speak(utterance);
}, []);
```

**Voice Queue Example:**

```
Agent responses arriving:
1. "Inventory Manager: Checked 150 items"
2. "Pricing Analyst: Suggested 8 price changes"
3. "Maintenance Coordinator: All equipment healthy"

Speech Queue Processing:
┌──────────────────────────────────────┐
│ Queue: [msg1, msg2, msg3]            │
│ Speaking: Inventory Manager (msg1)   │
│ Duration: 3.5 seconds                │
└──────────────────────────────────────┘
                │
         (3.5 seconds later)
                ▼
┌──────────────────────────────────────┐
│ Queue: [msg2, msg3]                  │
│ Speaking: Pricing Analyst (msg2)     │
│ Duration: 3.0 seconds                │
└──────────────────────────────────────┘
                │
         (3.0 seconds later)
                ▼
┌──────────────────────────────────────┐
│ Queue: [msg3]                        │
│ Speaking: Maintenance Coordinator    │
│           (msg3)                     │
│ Duration: 2.5 seconds                │
└──────────────────────────────────────┘
                │
         (2.5 seconds later)
                ▼
        Queue empty → Done
```

### 4. **Agent Voice Configuration**

```typescript
// From: lib/commander/scenarios.ts

export const AGENTS = {
  inventory_manager: {
    role: "Inventory Manager",
    voicePitch: 1.1,    // Slightly higher pitch
    voiceRate: 0.95,    // Slightly slower (more authoritative)
    color: "#3B82F6",
  },
  pricing_analyst: {
    role: "Pricing Analyst",
    voicePitch: 1.0,    // Normal pitch
    voiceRate: 1.0,     // Normal speed
    color: "#8B5CF6",
  },
  maintenance_coordinator: {
    role: "Maintenance Coordinator",
    voicePitch: 0.9,    // Deeper voice
    voiceRate: 0.9,     // Slower & authoritative
    color: "#EC4899",
  },
  customer_service: {
    role: "Customer Service Representative",
    voicePitch: 1.2,    // Friendly, higher pitch
    voiceRate: 1.05,    // Slightly faster (enthusiastic)
    color: "#F59E0B",
  },
  logistics_coordinator: {
    role: "Logistics Coordinator",
    voicePitch: 0.95,   // Neutral
    voiceRate: 1.0,     // Normal
    color: "#10B981",
  },
};
```

**Browser Support:**

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| SpeechRecognition | ✅ | ✅ | ✅ | ✅ |
| SpeechSynthesis | ✅ | ✅ | ✅ | ✅ |
| Interim Results | ✅ | ✅ | ⚠️ | ✅ |

---

## Shelf Monitor Feature

### Purpose & Capabilities

The **Shelf Monitor** system enables stores to:
- Automatically analyze product shelf images
- Detect brand distribution and space utilization
- Identify issues (empty shelves, damage, compliance violations)
- Generate AI-powered insights for space optimization
- Track compliance with supplier contracts
- Monitor trends over time

### Complete Processing Pipeline

#### Step 1: Image Upload & Validation

```typescript
// From: components/shelf-monitor/image-upload-card.tsx

const handleImageUpload = (file: File) => {
  // Validate file
  if (!file.type.startsWith("image/")) {
    throw new Error("Only images allowed");
  }
  
  // Convert to base64
  const reader = new FileReader();
  reader.onload = (event) => {
    const base64Image = event.target.result as string;
    
    // Send to backend
    analyzeShelf({
      image: base64Image,
      shelfLocation: "Aisle 3 - Beverages",
      storeId: "store-001",
    });
  };
};
```

#### Step 2: Backend Image Processing

```typescript
// From: app/api/shelf-share/analyze/route.ts

export async function POST(request: NextRequest) {
  const { image, shelfLocation, storeId } = await request.json();

  // Step 1: Validate
  if (!image || !shelfLocation) {
    return NextResponse.json({
      success: false,
      error: "Missing required fields"
    }, { status: 400 });
  }

  // Step 2: Convert base64 to bytes
  const imageBytes = await fileToBytes(image);

  // Step 3: Process with AWS services
  const analysis = await processShelfImage(
    imageBytes,
    shelfLocation
  );

  return NextResponse.json({
    success: true,
    data: analysis,
    message: "Shelf analysis completed"
  });
}

async function processShelfImage(
  imageBytes: Uint8Array,
  shelfLocation: string
): Promise<ShelfAnalysis> {
  const startTime = Date.now();
  
  // ... Step 3-10 detailed below
}
```

#### Step 3: AWS Rekognition Analysis

```typescript
// Purpose: Detect objects and products in the shelf image

export async function analyzeShelfWithRekognition(
  imageBytes: Uint8Array
) {
  const command = new DetectLabelsCommand({
    Image: { Bytes: imageBytes },
    MaxLabels: 100,           // Get up to 100 different objects
    MinConfidence: 40,        // Only confident detections
  });

  const response = await rekognitionClient.send(command);
  // Output: [
  //   { Name: "Coca-Cola", Confidence: 97.3 },
  //   { Name: "Pepsi", Confidence: 95.1 },
  //   { Name: "Sprite", Confidence: 92.8 },
  //   { Name: "Bottle", Confidence: 88.5 },
  //   { Name: "Shelf", Confidence: 99.2 },
  //   ...
  // ]
  return response;
}
```

**What Rekognition Detects:**
- Product brands and types (e.g., "Coca-Cola bottle", "Pepsi can")
- Containers and packaging
- Quantities and grouping
- Damaged items (lower confidence)
- Empty spaces (absence of detected items)
- Shelf structure and layout

#### Step 4: AWS Textract for Text/Labels

```typescript
// Purpose: Extract brand names and product info from labels/packaging

export async function extractBrandLabelsWithTextract(
  imageBytes: Uint8Array
) {
  const command = new AnalyzeDocumentCommand({
    Document: { Bytes: imageBytes },
    FeatureTypes: ["TABLES", "FORMS"],  // Extract structured data
  });

  const response = await textractClient.send(command);
  // Output Blocks: [
  //   { BlockType: "LINE", Text: "Coca-Cola Zero Sugar" },
  //   { BlockType: "LINE", Text: "Best Before: 2025-08-15" },
  //   { BlockType: "LINE", Text: "12 oz", Confidence: 98.2 },
  //   ...
  // ]
  return response;
}
```

**What Textract Extracts:**
- Product names and variants
- Expiration dates
- Sizes and quantities
- Nutritional information
- Pricing
- Barcodes & UPC codes

#### Step 5: Brand Detection & Mapping

```typescript
// Map detected labels to known brands

const BRAND_COLORS = {
  "Coca-Cola": "#EF3B36",  // Red
  "Pepsi": "#004687",      // Blue
  "Sprite": "#90EE90",     // Green
  "Fanta": "#FF6B35",      // Orange
  "Water": "#87CEEB",      // Light blue
  "Other": "#888888",      // Gray
};

const PRODUCT_TO_BRAND = {
  "coca cola": "Coca-Cola",
  "coke": "Coca-Cola",
  "pepsi": "Pepsi",
  "sprite": "Sprite",
  "fanta": "Fanta",
  "water": "Water",
};

function getBrandFromLabel(label: string): string | null {
  const lowerLabel = label.toLowerCase();
  
  // Check direct mapping
  for (const [product, brand] of Object.entries(PRODUCT_TO_BRAND)) {
    if (lowerLabel.includes(product)) {
      return brand;
    }
  }
  
  // Check brand names directly
  for (const brand of Object.keys(BRAND_COLORS)) {
    if (lowerLabel.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  return null;
}

// Calculate percentages
const brandCounts = {};
for (const label of allDetectedLabels) {
  const brand = getBrandFromLabel(label);
  if (brand) {
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  }
}

const brands = Object.entries(brandCounts)
  .map(([brandName, count]) => ({
    brand_name: brandName,
    percentage: Math.round((count / totalItems) * 100),
    color: BRAND_COLORS[brandName],
  }))
  .sort((a, b) => b.percentage - a.percentage);

// Example output:
// [
//   { brand_name: "Coca-Cola", percentage: 38, color: "#EF3B36" },
//   { brand_name: "Pepsi", percentage: 31, color: "#004687" },
//   { brand_name: "Sprite", percentage: 18, color: "#90EE90" },
//   { brand_name: "Fanta", percentage: 8, color: "#FF6B35" },
//   { brand_name: "Other", percentage: 5, color: "#888888" },
// ]
```

#### Step 6: Issue Detection

```typescript
// Identify compliance and operational issues

const detectedIssues = [];

// Issue 1: Low confidence detections → possible damage
const lowConfidenceLabels = labels.filter(
  l => l.Confidence && l.Confidence < 50
);
if (lowConfidenceLabels.length > 0) {
  detectedIssues.push({
    type: "damaged_item",
    severity: "low",
    location: "Mixed",
    description: `${lowConfidenceLabels.length} items with low confidence - possible damage`,
  });
}

// Issue 2: Brand dominance → contract violation
const maxBrand = Math.max(...brands.map(b => b.percentage));
if (maxBrand > 70) {
  detectedIssues.push({
    type: "brand_dominance",
    severity: "medium",
    location: "Entire Shelf",
    description: `${brands[0].brand_name} occupies ${maxBrand}% - exceeds contract limit of 70%`,
  });
}

// Issue 3: Empty space → restock needed
if (brands.reduce((sum, b) => sum + b.percentage, 0) < 70) {
  detectedIssues.push({
    type: "empty_spot",
    severity: "medium",
    location: "Shelf Area",
    description: "Empty shelf space detected - restocking recommended",
  });
}

// Issue 4: Missing brand → contract violation
const expectedBrands = ["Coca-Cola", "Pepsi", "Sprite"];
const foundBrands = brands.map(b => b.brand_name);
const missingBrands = expectedBrands.filter(
  b => !foundBrands.includes(b)
);
if (missingBrands.length > 0) {
  detectedIssues.push({
    type: "missing_brand",
    severity: "high",
    location: "Contract",
    description: `Missing required brands: ${missingBrands.join(", ")}`,
  });
}
```

#### Step 7: AI Insights Generation with Bedrock

```typescript
// Use Claude to generate actionable insights

export async function generateInsightsWithBedrock(analysisData) {
  const prompt = `You are a retail analytics expert. Analyze this shelf monitoring data:

Detected Labels: ${analysisData.labels.join(", ")}
Brand Distribution: ${JSON.stringify(analysisData.detectedBrands)}
Detected Issues: ${analysisData.issues.join(", ")}

Provide a concise analysis (2-3 sentences) on:
1. Overall shelf health
2. Brand presence effectiveness
3. Key recommendations

Be specific and actionable.`;

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-06-01",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: prompt,
      }],
    }),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(
    new TextDecoder().decode(response.body)
  );
  
  // Example response:
  // "Coca-Cola dominates with 38% of shelf space, which is within 
  //  contract limits. Brand distribution is well-balanced across 5 
  //  brands. Recommend focusing on empty spaces - currently only 68% 
  //  of shelf is occupied. Consider featuring Sprite and Fanta more 
  //  prominently to boost their visibility and sales."
  
  return responseBody.content?.[0]?.text;
}
```

#### Step 8: Health Score Calculation

```typescript
// Calculate a 0-100 health score for the shelf

function calculateHealthScore(
  brands: Brand[],
  issues: Issue[]
): number {
  let score = 100;

  // Deduct for issues
  for (const issue of issues) {
    if (issue.severity === "high") score -= 20;      // Critical issue
    else if (issue.severity === "medium") score -= 10; // Moderate issue
    else score -= 5;                                  // Minor issue
  }

  // Deduct if any brand dominates too much (>70%)
  const maxBrand = Math.max(...brands.map(b => b.percentage), 0);
  if (maxBrand > 70) score -= 15;

  // Bonus if well-distributed
  const avgPercentage = 100 / brands.length;
  const variance = brands.reduce(
    (sum, b) => sum + Math.abs(b.percentage - avgPercentage),
    0
  ) / brands.length;
  if (variance < 10) score += 10;  // Well-balanced

  return Math.max(Math.min(score, 100), 0);
}

// Example calculations:
// Scenario 1: No issues, balanced distribution
//   score = 100 + 10 (variance bonus) = 100
//
// Scenario 2: 1 medium issue, Coca-Cola at 75%
//   score = 100 - 10 (issue) - 15 (dominance) = 75
//
// Scenario 3: 1 high issue, 2 low issues, 80% occupancy
//   score = 100 - 20 (high) - 10 (low) - 5 (low) - 15 (dominance) = 50
```

#### Step 9: Data Persistence

```typescript
// Store analysis in DynamoDB for history/trends

export async function storeAnalysisInDynamoDB(
  analysis: ShelfAnalysis,
  storeId = "default"
) {
  const now = Date.now();
  const ttl = Math.floor(now / 1000) + 90 * 24 * 60 * 60; // 90 days

  const command = new PutItemCommand({
    TableName: "ShelfAnalyses",
    Item: {
      // Partition key: store identifier
      storeId: { S: storeId },
      
      // Sort key: timestamp (enables time-series queries)
      analyzedAt: { N: String(now) },
      
      // Analysis metadata
      analysisId: { S: analysis.analysis_id },
      shelfLocation: { S: analysis.shelf_location },
      
      // Results
      healthScore: { N: String(analysis.shelf_health_score) },
      brands: { S: JSON.stringify(analysis.brands) },
      issues: { S: JSON.stringify(analysis.issues) },
      insights: { S: analysis.insights },
      
      // Auto-expiry for cost savings
      ttl: { N: String(ttl) },
    },
  });

  await dynamodbClient.send(command);
}

// DynamoDB Schema:
// TableName: ShelfAnalyses
// Partition Key: storeId (String)
// Sort Key: analyzedAt (Number - Unix timestamp)
// TTL: ttl (Number - expires after 90 days)
// GSI: shelfLocation-analyzedAt (for trending by location)
```

#### Step 10: S3 Image Storage

```typescript
// Upload original image to S3 for archival/reference

export async function uploadImageToS3(
  imageBytes: Uint8Array,
  fileName: string,
  storeId = "default"
): Promise<string> {
  const timestamp = new Date().toISOString().split("T")[0];
  const key = `shelf-analysis/${storeId}/${timestamp}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: "shelf-share-images",
    Key: key,
    Body: imageBytes,
    ContentType: "image/jpeg",
  });

  await s3Client.send(command);
  return `s3://shelf-share-images/${key}`;
}

// S3 Storage Structure:
// shelf-share-images/
// ├── shelf-analysis/
// │   ├── store-001/
// │   │   ├── 2025-02-19/
// │   │   │   ├── analysis-1739958742-abc123.jpg
// │   │   │   ├── analysis-1739958850-def456.jpg
// │   │   │   └── ...
// │   │   ├── 2025-02-18/
// │   │   └── ...
// │   └── store-002/
// │       └── ...
```

### Analytics & Trending

```typescript
// From: app/api/shelf-share/history/route.ts

export async function queryAnalysisHistory(
  storeId = "default",
  limit = 50,
  afterTimestamp?: number
) {
  const command = new QueryCommand({
    TableName: "ShelfAnalyses",
    KeyConditionExpression: "storeId = :storeId",
    ExpressionAttributeValues: {
      ":storeId": { S: storeId },
    },
    Limit: limit,
    ScanIndexForward: false,  // Most recent first
  });

  const response = await dynamodbClient.send(command);
  
  // Returns historical analyses for trending:
  // - Health score over time
  // - Brand distribution changes
  // - Issue patterns
  // - Compliance tracking
  
  return response.Items;
}

// Example analysis trend:
// Day 1: Coca-Cola 35%, Pepsi 30%, Others 35% → Health: 85
// Day 2: Coca-Cola 38%, Pepsi 31%, Others 31% → Health: 78 (dominance)
// Day 3: Coca-Cola 38%, Pepsi 31%, Sprite 15%, Others 16% → Health: 82
//   Insight: Need to reduce Coca-Cola share to <35% per contract
```

---

## AWS Services & Integration Details

### 1. **AWS Bedrock**

**Service Type:** Managed Foundation Models

**Capabilities:**
- Access to multiple LLMs (Claude, Amazon Nova, Cohere, etc.)
- Pay-per-token pricing (no upfront commitment)
- Handles scaling and infrastructure
- Built-in security & compliance (SOC 2, HIPAA, PCI-DSS)

**Integration in Project:**

```python
# LLM Initialization
from langchain_aws.chat_models.bedrock import ChatBedrock

bedrock_llm = ChatBedrock(
    region_name="us-east-1",
    model_id="amazon.nova-pro-v1:0",
    model_kwargs={
        "max_tokens": 1024,
        "temperature": 0.2,  # Deterministic
    }
)

# Used by CrewAI agents for:
# - Task reasoning and planning
# - Tool selection and invocation
# - Response generation
# - Context synthesis
```

**Cost Example (us-east-1):**
- Input: $0.0008 per 1K tokens (Amazon Nova)
- Output: $0.0024 per 1K tokens
- **Typical store operations run:** ~500K tokens = ~$2.00

**Requirement:**
- ✅ AWS account with Bedrock enabled
- ✅ IAM role with bedrock:InvokeModel permission
- ✅ Model access request approved (instant for Nova)

---

### 2. **Amazon Rekognition**

**Service Type:** Computer Vision API

**Capabilities:**
- Object and scene detection
- Label identification
- Face recognition (not used here)
- Text detection in images
- Moderation (explicit content)

**Integration in Project:**

```typescript
import {
  RekognitionClient,
  DetectLabelsCommand,
} from "@aws-sdk/client-rekognition";

const rekognitionClient = new RekognitionClient({
  region: "us-east-1"
});

const command = new DetectLabelsCommand({
  Image: { Bytes: imageBytes },
  MaxLabels: 100,      // Detect up to 100 items
  MinConfidence: 40,   // Only high-confidence detections
});

const response = await rekognitionClient.send(command);
// Returns: Array of detected labels with confidence scores
```

**Use Cases in Shelf Monitor:**
1. **Product Detection:** Identify brands and packaging
2. **Quantity Estimation:** Count products on shelf
3. **Damage Detection:** Low confidence = possible damage
4. **Space Utilization:** Detect empty areas
5. **Layout Analysis:** Shelf organization patterns

**Pricing:**
- $0.0002 per image analyzed (us-east-1)
- **Typical project:** ~5 analyses/day = ~$0.30/month

---

### 3. **Amazon Textract**

**Service Type:** OCR and Document Analysis

**Capabilities:**
- Extract text from images
- Detect tables and forms
- Confidence scores per extraction
- Structured data extraction

**Integration in Project:**

```typescript
import {
  TextractClient,
  AnalyzeDocumentCommand,
} from "@aws-sdk/client-textract";

const textractClient = new TextractClient({
  region: "us-east-1"
});

const command = new AnalyzeDocumentCommand({
  Document: { Bytes: imageBytes },
  FeatureTypes: ["TABLES", "FORMS"],  // What to extract
});

const response = await textractClient.send(command);
// Returns: Blocks with extracted text, confidence, geometry
```

**Use Cases in Shelf Monitor:**
1. **Brand Name Extraction:** Read product labels
2. **Expiration Date Detection:** Identify expired products
3. **Price Recognition:** Extract pricing information
4. **Barcode/UPC Reading:** Product identification
5. **Nutritional Info:** Extract product details

**Pricing:**
- $1.50 per 1000 pages (images count as pages)
- **Typical project:** ~150 analyses/month = ~$2.25/month

---

### 4. **Amazon DynamoDB**

**Service Type:** NoSQL Database

**Features:**
- Key-value and document storage
- Automatic scaling
- Time-to-Live (TTL) for automatic cleanup
- Point-in-time recovery

**Schema in Project:**

```
// Table: ShelfAnalyses
{
  storeId (S),           // Partition Key
  analyzedAt (N),        // Sort Key (timestamp)
  analysisId (S),        // Unique analysis ID
  shelfLocation (S),     // Where shelf is
  healthScore (N),       // 0-100 score
  brands (S),           // JSON array
  issues (S),           // JSON array
  insights (S),         // AI-generated text
  imageUrl (S),         // S3 reference
  ttl (N),              // Unix timestamp - auto-delete at 90 days
}

// Table: Inventory
{
  sku (S),              // Partition Key
  name (S),             // Product name
  quantity (N),         // Current stock
  reorder_threshold (N),// When to auto-order
  unit (S),             // Units (pieces, lbs, etc)
}

// Table: Equipment
{
  equipment_id (S),     // Partition Key
  name (S),             // Equipment name
  health_score (N),     // 0-1 score
  last_maintenance (S), // ISO date
  type (S),             // HVAC, Freezer, etc
}

// Table: Orders
{
  order_id (S),         // Partition Key (UUID)
  sku (S),              // Product SKU
  quantity (N),         // Quantity ordered
  order_status (S),     // pending, shipped, delivered
  created_at (N),       // Timestamp
}

// Table: Customers
{
  customer_id (S),      // Partition Key
  name (S),             // Customer name
  loyalty_tier (S),     // bronze, silver, gold
  lifetime_purchases (N), // Total spent
  last_visit (S),       // ISO date
}
```

**Integration in Project:**

```python
from aws.dynamodb import (
    get_inventory,
    list_low_stock,
    put_order,
    get_equipment,
    get_customer,
)

# Used by agents for:
# - Inventory lookups
# - Order creation
# - Equipment status
# - Customer data
```

**Pricing (On-demand):**
- Write: $1.25 per million write units
- Read: $0.25 per million read units
- Storage: $0.25 per GB
- **Typical project:** ~$5-10/month

---

### 5. **Amazon S3**

**Service Type:** Object Storage

**Features:**
- Scalable image/document storage
- Lifecycle policies for cost optimization
- Access control (IAM, bucket policies)
- Versioning support

**Integration in Project:**

```typescript
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "us-east-1" });

const command = new PutObjectCommand({
  Bucket: "shelf-share-images",
  Key: `shelf-analysis/store-001/2025-02-19/analysis-123.jpg`,
  Body: imageBytes,
  ContentType: "image/jpeg",
});

await s3Client.send(command);
```

**Storage Structure:**
```
shelf-share-images/
├── shelf-analysis/
│   ├── store-001/
│   │   ├── 2025-02-19/    (Daily folder)
│   │   │   ├── analysis-1739958742-abc123.jpg
│   │   │   └── ...
│   │   └── 2025-02-18/
│   └── store-002/
```

**Lifecycle Policy (Cost Optimization):**
```json
{
  "Rules": [
    {
      "Id": "DeleteOldAnalyses",
      "Filter": { "Prefix": "shelf-analysis/" },
      "Expiration": { "Days": 90 },
      "Status": "Enabled"
    },
    {
      "Id": "TransitionToIA",
      "Filter": { "Prefix": "shelf-analysis/" },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        }
      ],
      "Status": "Enabled"
    }
  ]
}
```

**Pricing:**
- Storage: $0.023/GB/month (first 50TB)
- Data transfer: $0.09/GB out
- **Typical project:** 100 images/month × 2MB = 200MB = ~$0.05/month

---

### 6. **AWS Step Functions**

**Service Type:** Workflow Orchestration

**Capabilities:**
- Define complex workflows as state machines
- Parallel and sequential execution
- Error handling and retries
- Integration with 200+ AWS services

**Integration in Project:**

```json
{
  "Comment": "Store Operations Workflow",
  "StartAt": "RunCrewAI",
  "States": {
    "RunCrewAI": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": {
        "FunctionName": "run-crew-agents",
        "Payload": {
          "store_id.$": "$.store_id"
        }
      },
      "Next": "CheckResult"
    },
    "CheckResult": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.success",
          "BooleanEquals": true,
          "Next": "UpdateInventory"
        }
      ],
      "Default": "HandleError"
    },
    "UpdateInventory": {
      "Type": "Task",
      "Resource": "arn:aws:states:::dynamodb:updateItem",
      "End": true
    },
    "HandleError": {
      "Type": "Task",
      "Resource": "arn:aws:states:::sns:publish",
      "End": true
    }
  }
}
```

---

### 7. **AWS IoT Core**

**Service Type:** IoT Device Communication

**Capabilities:**
- MQTT message broker
- Device shadow (desired/reported state)
- Rules engine for data processing
- Secure device authentication

**Potential Use Cases:**
- Equipment sensors → health score updates
- Shelf sensors → automatic image triggers
- Mobile devices → data collection
- Real-time alerts → maintenance notifications

---

## System Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Pages: Commander, Dashboard, Shelf-Share         │   │
│  │ Components: VoiceOrb, AgentConstellation, Charts │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐    ┌───────▼──────────┐
│  Next.js API   │    │  FastAPI Server  │
│  Routes        │    │  (Python)        │
│                │    │                  │
│ • Shelf-Share  │    │ • /stream-crew   │
│ • Analysis     │    │ • /inventory     │
│ • History      │    │ • /orders        │
└───────┬────────┘    └───────┬──────────┘
        │                     │
        │              ┌──────▼─────────┐
        │              │  CrewAI Crew   │
        │              │  Sequential    │
        │              │  Process       │
        │              └──────┬─────────┘
        │                     │
        └─────────────┬───────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
┌──────▼──────┐ ┌────▼──────┐ ┌────▼──────┐
│ AWS Services│ │ Analytics │ │ Utilities  │
├──────────────┤ ├───────────┤ ├───────────┤
│ • Bedrock   │ │ • Data    │ │ • Logging │
│ • Rekognition
│ • Textract  │ │ • Insights│ │ • Caching │
│ • DynamoDB  │ │           │ │           │
│ • S3        │ │           │ │           │
│ • Step Func │ │           │ │           │
└─────────────┘ └───────────┘ └───────────┘
```

### Data Flow Diagram

```
User Input
├─ Voice (Speech Recognition API)
├─ Text (Command Center)
└─ Image (Shelf-Share Upload)
         │
         ▼
Backend Processing
├─ Text → Agent Brain → Bedrock → CrewAI
├─ Image → Rekognition + Textract + Bedrock
└─ Streaming SSE → Real-time UI updates
         │
         ▼
AWS Services
├─ Bedrock: LLM reasoning
├─ Rekognition: Label detection
├─ Textract: OCR
├─ DynamoDB: Data storage
└─ S3: Image archival
         │
         ▼
Frontend Display
├─ Agent Constellation
├─ Conversation Transcript
├─ Shelf Analysis Results
└─ Analytics Dashboard
```

---

## Deployment & Configuration

### Environment Variables

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=default (optional)

# Bedrock Model Configuration
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0

# DynamoDB Tables
INVENTORY_TABLE=Inventory
ORDERS_TABLE=Orders
EQUIPMENT_TABLE=Equipment
CUSTOMERS_TABLE=Customers
STAFF_SCHEDULES_TABLE=StaffSchedules
SHELF_ANALYSES_TABLE=ShelfAnalyses

# S3 Bucket
AWS_S3_BUCKET=shelf-share-images

# Next.js Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Frontend Configuration
NEXT_PUBLIC_STORE_ID=store-001
```

### AWS Permissions (IAM Policy)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "rekognition:DetectLabels",
        "rekognition:DetectText"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "textract:AnalyzeDocument"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::shelf-share-images/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "states:StartExecution",
        "states:DescribeExecution"
      ],
      "Resource": "arn:aws:states:*:*:stateMachine:*"
    }
  ]
}
```

### Database Initialization

```bash
# Create DynamoDB tables
aws dynamodb create-table \
  --table-name Inventory \
  --attribute-definitions AttributeName=sku,AttributeType=S \
  --key-schema AttributeName=sku,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Create S3 bucket
aws s3 mb s3://shelf-share-images

# Enable lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
  --bucket shelf-share-images \
  --lifecycle-configuration file://lifecycle.json
```

---

## Summary

The **AWS-AgenticAI** system is a production-ready platform that demonstrates:

1. **AI Agents:** Multi-agent orchestration using CrewAI + Bedrock
2. **Voice Integration:** Browser-native speech input/output
3. **Computer Vision:** Intelligent image analysis for shelf monitoring
4. **Data Persistence:** DynamoDB for operational data, S3 for media
5. **Real-time Streaming:** SSE for live agent execution updates
6. **AWS Integration:** Bedrock, Rekognition, Textract, DynamoDB, S3, Step Functions

**Key Achievement:** A fully autonomous retail operations platform that makes business-critical decisions without human intervention.

