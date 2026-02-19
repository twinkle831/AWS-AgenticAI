# AWS-AgenticAI Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER (Next.js 15)                          │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  Landing Page        │  │  Command Center      │  │  Dashboard       │  │
│  │  (Hero, Features)    │  │  (Voice + Text)      │  │  (Analytics)     │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│                                                                             │
│  ┌────────────────────┐  ┌──────────────────────────────┐                  │
│  │ Shelf-Share        │  │ Dashboard Modules            │                  │
│  │ (Image Upload +    │  │ - Inventory                  │                  │
│  │  Analysis)         │  │ - Pricing                    │                  │
│  └────────────────────┘  │ - Maintenance                │                  │
│                          │ - Customer Service           │                  │
│                          │ - Logistics                  │                  │
│                          └──────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
        ┌────────▼────────┐ ┌──────▼──────┐  ┌────────▼────────┐
        │  Next.js API    │ │ Web Speech  │  │  Shelf-Share    │
        │  Routes         │ │ API         │  │  REST APIs      │
        │ (type-safe)     │ │ (Voice I/O) │  │ (Image Upload)  │
        └────────┬────────┘ └────────────┘  └────────┬────────┘
                 │                                    │
└────────────────┼────────────────────────────────────┼──────────────────────┘
                 │                                    │
                 ▼                                    ▼
    ┌─────────────────────────────────────────────────────────┐
    │          BACKEND INTEGRATION LAYER                       │
    │  ┌──────────────────────────────────────────────────┐   │
    │  │  FastAPI Server (Python)                         │   │
    │  │  - SSE Streaming for Real-time Logs             │   │
    │  │  - Crew orchestration endpoints                 │   │
    │  │  - Data access APIs                             │   │
    │  └──────────────────────────────────────────────────┘   │
    └────────────┬──────────────────────┬───────────────────┘
                 │                      │
        ┌────────▼────────┐  ┌──────────▼─────────┐
        │  CrewAI Agents  │  │  AWS Service       │
        │  (Orchestration)│  │  Integration       │
        └────────┬────────┘  └──────────┬─────────┘
                 │                      │
    ┌────────────▼──────────────────────▼────────────────────────┐
    │                    AWS SERVICES LAYER                       │
    │                                                             │
    │  ┌──────────────────┐  ┌──────────────────────────────┐   │
    │  │ AWS Bedrock      │  │ Computer Vision Services     │   │
    │  │ - Claude Model   │  │ - Amazon Rekognition        │   │
    │  │ - Amazon Nova    │  │ - Amazon Textract           │   │
    │  │ - LangChain      │  │ - Feature extraction        │   │
    │  │  Integration     │  │ - OCR & text detection      │   │
    │  └──────────────────┘  └──────────────────────────────┘   │
    │                                                             │
    │  ┌──────────────────┐  ┌──────────────────────────────┐   │
    │  │ Data Storage     │  │ Media Storage                │   │
    │  │ - DynamoDB       │  │ - Amazon S3                 │   │
    │  │   (Tables)       │  │   (Images)                  │   │
    │  │ - TTL support    │  │   (Analysis results)        │   │
    │  └──────────────────┘  └──────────────────────────────┘   │
    │                                                             │
    │  ┌──────────────────┐  ┌──────────────────────────────┐   │
    │  │ Orchestration    │  │ IoT & Monitoring            │   │
    │  │ - Step Functions │  │ - AWS IoT Core              │   │
    │  │   (Workflows)    │  │   (Event streaming)         │   │
    │  └──────────────────┘  └──────────────────────────────┘   │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
USER INTERACTION LAYER
      │
      ├─ Voice Input (Web Speech API)
      │     └─ SpeechRecognition API → useVoice hook
      │
      ├─ Text Input
      │     └─ Command Center → Agent Brain
      │
      └─ Image Upload
            └─ Shelf-Share Component → AWS Services
               
PROCESSING FLOW

Voice/Text → Commander Agent Brain → Stream to FastAPI /stream-crew
                                            │
                                            ▼
                                      CrewAI Execution
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
            Inventory Manager      Pricing Analyst      Maintenance Coordinator
            - DynamoDB queries     - Price optimization  - Equipment health
            - Reorder logic        - Demand analysis      - Predictive maint.
                    │                       │                       │
                    └───────────────────────┼───────────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
            Customer Service Agent   Logistics Agent       AWS Services
            - Loyalty tiers          - Route optimization  - Step Functions
            - Customer lookup        - Delivery planning   - DynamoDB updates
                    │                       │                       │
                    └───────────────────────┼───────────────────────┘
                                            │
                                            ▼
                                    SSE Stream Response
                                    (Real-time logs)
                                            │
                                            ▼
                                    Frontend Display
                                    (Agent Constellation,
                                     Conversation Transcript)


IMAGE ANALYSIS FLOW

User Upload Image (Shelf-Share)
         │
         ▼
    /api/shelf-share/analyze
         │
    ┌────┴─────────────────────────┐
    │                              │
    ▼                              ▼
Rekognition                   Textract
(Label Detection)             (OCR)
(objects, products)           (text extraction)
    │                              │
    └────────────┬─────────────────┘
                 │
                 ▼
          Brand Detection
          (Product mapping)
                 │
                 ▼
          Bedrock Analysis
          (Claude insights)
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
    DynamoDB          S3
    (Metadata)        (Images)
         │                │
         └────────┬───────┘
                  │
                  ▼
         Frontend Display
         (Health score, brand share, issues)
```

## Detailed Service Interactions

### 1. **Bedrock Agent Execution Model**

```
Command Input (Voice or Text)
         │
         ▼
AgentBrain Routing Logic
         │
    ┌────┴────────────────────┐
    │                         │
    ▼                         ▼
Text Prompt          Vector Embedding
         │                    │
         └────────┬───────────┘
                  │
                  ▼
        LangChain ChatBedrock
        (Bedrock SDK Integration)
                  │
         ┌────────┼────────┐
         │        │        │
         ▼        ▼        ▼
    Amazon   Amazon Claude  Function
    Nova-Pro Opus 4        Calling
    (Default) (Optional)    (Tools)
         │        │        │
         └────────┼────────┘
                  │
                  ▼
    CrewAI Agent Tool Invocation
         │
    ┌────┴──────────────────────────┐
    │                               │
    ▼                               ▼
DynamoDB Tools                 AWS Service Tools
- Inventory lookup             - S3 upload
- Order creation               - Rekognition
- Equipment status             - Textract
- Customer query               - Step Functions
    │                               │
    └───────────────┬───────────────┘
                    │
                    ▼
            Response Generation
                    │
                    ▼
         Text-to-Speech Output
        (Browser speech synthesis)
```

### 2. **Voice Feature Architecture**

```
Audio Input
   │
   ▼
Web SpeechRecognition API (Browser)
   │
   ├─ Continuous: false
   ├─ Interim Results: true
   ├─ Language: en-US
   │
   ▼
useVoice Hook (Custom)
   │
   ├─ State Management
   │  ├─ isListening (boolean)
   │  ├─ transcript (final text)
   │  ├─ interimTranscript (live preview)
   │  └─ isSupported (browser capability)
   │
   ├─ Recognition Event Handlers
   │  ├─ onresult → update transcript
   │  ├─ onend → finalize and callback
   │  └─ onerror → handle error state
   │
   ▼
Transcript Processing
   │
   ├─ Route to AgentBrain
   ├─ Generate Bedrock prompt
   ├─ Stream response to frontend
   │
   ▼
Text-to-Speech Output
   │
   ├─ SpeechSynthesis API
   ├─ Queue management for multiple agents
   ├─ Voice pitch/rate per agent
   ├─ Mute support
   │
   └─ Agent-specific voices (round-robin)
```

### 3. **Shelf Monitor Feature Flow**

```
Step 1: Image Capture
    └─ User uploads shelf image via Shelf-Share UI
             │
             ▼
Step 2: Image Processing
    ├─ Convert to bytes
    ├─ Validate format (JPEG)
    └─ Generate unique analysis ID
             │
             ├─────────────────────────────┐
             │                             │
Step 3: AWS Analysis              Step 4: Text Recognition
    │                                 │
    ├─ Rekognition                   └─ Textract
    │  └─ DetectLabels Command        └─ AnalyzeDocument
    │     • Max 100 labels               • TABLES, FORMS
    │     • MinConfidence: 40%           • Brand text extraction
    │
    ├─ Output: Labels + Confidence
    │
    └─ Output: Raw text blocks
             │
             └─────────────────────────────┘
                       │
                       ▼
Step 5: Brand Mapping
    ├─ Match detected labels against brand registry
    ├─ Calculate percentages
    ├─ Assign brand colors (#hex)
    └─ Group by product family
             │
             ▼
Step 6: Issue Detection
    ├─ Low confidence items → possible damage
    ├─ Missing brands → restock alerts
    ├─ Coverage analysis → empty space detection
    └─ Dominance check → brand concentration warnings
             │
             ▼
Step 7: AI Insights
    ├─ Bedrock Prompt Construction
    │  └─ Include: labels, brand counts, detected issues
    ├─ Claude Model Processing
    │  └─ Generate: 2-3 sentence recommendations
    └─ Actionable recommendations
             │
             ├───────────────────────────┐
             │                           │
Step 8: Data Persistence            Step 9: Media Storage
    │                                   │
    └─ DynamoDB Put                     └─ S3 Upload
       • analysisId (PK)                   • Timestamped path
       • storeId (SK)                      • shelf-analysis/store/date/
       • analyzedAt timestamp             • Retention: 90 days (TTL)
       • healthScore (calculated)
       • brands (JSON array)
       • issues (JSON array)
       • insights (AI text)
       • TTL: 90 days
             │
             └───────────────────────────┘
                       │
                       ▼
Step 10: Frontend Response
    └─ ShelfAnalysis object with:
       ├─ Health score (0-100)
       ├─ Brand distribution chart data
       ├─ Issues with severity
       ├─ AI insights text
       └─ Processing time metadata
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 | Web framework, routing, SSR |
| | React 19 | UI components & state |
| | Tailwind CSS 4 | Styling & responsive design |
| | Recharts | Data visualization |
| **Voice** | Web Speech API | Speech recognition & synthesis |
| **Backend** | FastAPI | REST API & SSE streaming |
| **AI/Agents** | CrewAI | Multi-agent orchestration |
| | LangChain | LLM integration framework |
| **AWS Bedrock** | Claude / Amazon Nova | LLM for agent reasoning |
| **Vision** | Rekognition | Object detection & labeling |
| | Textract | OCR & text extraction |
| **Storage** | DynamoDB | NoSQL data storage |
| | S3 | Image & asset storage |
| **Orchestration** | Step Functions | Workflow automation |
| | IoT Core | Event streaming |

