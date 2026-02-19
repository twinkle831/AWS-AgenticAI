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

The system initializes a Bedrock language model with AWS credentials. The platform uses either Amazon Nova Pro or Claude 3 Sonnet models depending on performance requirements. Amazon Nova Pro is the default choice because it offers fast inference and cost-effectiveness. The model is configured with specific parameters: a maximum token limit of 1024 tokens for response length, and a temperature setting of 0.2 to ensure deterministic outputs with minimal randomness.

Bedrock is chosen as the LLM provider because it requires no API keys (uses AWS IAM credentials instead), offers per-token pricing that scales efficiently, provides access to multiple foundation models, and includes built-in security and compliance features. The available models include Amazon Nova Pro (fastest and most cost-effective), Claude 3 Sonnet (more capable with higher cost), and Claude Opus (most powerful for complex reasoning).

#### 2. **Agent Definitions**

Five specialized agents handle different business domains:

**Inventory Manager:** This agent is responsible for keeping stock levels optimal. Its primary goals include tracking inventory, predicting demand patterns, and automatically creating purchase orders when items fall below reorder thresholds. The agent has access to tools that allow it to query current inventory levels, identify low-stock items, update inventory records, and generate purchase orders.

**Pricing Analyst:** This agent sets dynamic prices to maximize revenue. It analyzes demand signals, competitive pricing, and current stock levels to recommend price adjustments. The agent can query pricing suggestions, access inventory data, and provide recommendations to optimize revenue while maintaining competitiveness.

**Maintenance Coordinator:** This agent ensures equipment reliability through predictive and reactive maintenance. It monitors equipment health, schedules maintenance tasks before failures occur, and coordinates repairs. The agent has access to tools for checking equipment status and retrieving lists of all store equipment.

**Customer Service Representative:** This agent handles customer queries and manages the loyalty program. It provides personalized service based on customer loyalty tiers and purchase history. The agent can look up customer information, determine loyalty tier status, and prepare customized offers.

**Logistics Coordinator:** This agent optimizes delivery routes and ensures orders arrive on time. It analyzes pending deliveries, identifies route inefficiencies, and suggests optimized delivery sequences to reduce costs and improve on-time performance. The agent can retrieve pending deliveries and suggest optimal route plans.

#### 3. **Task Orchestration (Sequential Process)**

Each agent executes a specific task in a predetermined sequence. This sequential approach ensures that each agent's output becomes context for the next agent, creating collaborative intelligence across the system.

The execution flow works as follows:

1. **Inventory Manager executes first:** Queries DynamoDB to find low-stock items and creates purchase orders for critical items. This agent provides a comprehensive inventory snapshot.

2. **Pricing Analyst executes second:** Receives the inventory context from the Inventory Manager and uses it to suggest dynamic price adjustments. The agent considers stock levels when making pricing recommendations to maximize revenue.

3. **Maintenance Coordinator executes third:** Checks equipment health status and schedules preventive maintenance tasks. This agent ensures equipment is in optimal working condition.

4. **Customer Service representative executes fourth:** Looks up customer loyalty tiers and prepares personalized offers based on the context provided by previous agents. This agent enhances customer retention.

5. **Logistics Coordinator executes fifth:** Analyzes pending deliveries and suggests optimal routes. Having context from all previous agents allows this agent to make informed routing decisions.

Each agent's output feeds into the next agent, creating a continuous flow of intelligence where decisions build upon previous analysis.

#### 4. **Tool Calling Mechanism**

Tools are functions that agents can invoke to access data or perform actions. When an agent receives a task, it analyzes the task description and decides which tools to call. The Bedrock LLM returns the name of the tool and the parameters needed. CrewAI then executes the actual tool (which might query DynamoDB, perform calculations, or make API calls), and the result is passed back to the agent. The agent continues reasoning with this new information and may call additional tools or formulate its final response.

For example, when the Inventory Manager receives the task "Check low stock and create orders," it might:
1. Call the "list low stock" tool to identify items below reorder thresholds
2. Receive a list of 5 items that are critically low
3. Call the "create order" tool for each critical item with appropriate quantities
4. Generate a summary of orders created and their expected delivery dates

This iterative process continues until the agent determines the task is complete.

#### 5. **Key Design Decision: Function Calling LLM**

A critical design decision is passing the same language model as the "function calling LLM" to the agent system. This ensures that Amazon Nova models, which don't support traditional ReAct reasoning loops, use native function calling instead. This approach makes agents significantly faster and more reliable because the model directly decides which tools to call rather than attempting text-based reasoning about tool usage. This native function calling provides structured, deterministic tool invocation.

### 6. **Real-Time Execution & Streaming**

#### FastAPI SSE Streaming Architecture

The backend uses Server-Sent Events (SSE) to stream real-time agent execution logs to the frontend. When the frontend connects to the `/stream-crew` endpoint, it establishes a persistent connection that receives live updates as agents execute.

The streaming process works as follows:

1. **Connection Establishment:** The frontend creates an EventSource connection to the streaming endpoint, specifying the store ID and trigger type.

2. **Background Execution:** The backend creates an asynchronous queue and runs the entire crew (all agents) in a background thread. All output from the agents is captured and placed into the queue.

3. **Real-Time Log Transmission:** As agents execute and produce output, each log message is analyzed to determine which agent produced it. The message, agent name, and timestamp are formatted as a JSON event and sent to the client immediately.

4. **Final Result Transmission:** When all agents complete their tasks, the backend sends a special "done" event containing the final result summary and then closes the connection.

**Benefits of this approach:**

- Users see real-time progress as agents work (no 30-second wait for completion)
- The Command Center UI updates live with agent activity
- Users can see exactly what each agent is doing and when
- The agent constellation display shows real-time status changes
- If users need to troubleshoot, they can see the complete execution flow

---

## Voice Feature Implementation

### Architecture Overview

The voice system enables users to speak natural language commands to AI agents and receive spoken responses using browser-native Web Speech APIs. This creates a conversational interface where users can interact with the agent system using their voice.

### 1. **Voice Input: Speech Recognition**

The system uses the browser's native Web Speech Recognition API, which is available in modern browsers (Chrome, Edge, Safari). When a user clicks the microphone button to start listening, the browser begins capturing audio from the user's microphone.

**Speech Recognition Process:**

As the user speaks, the browser's speech recognition engine processes the audio in real-time. The browser sends back two types of results: interim results (what the system thinks the user is saying as they speak) and final results (confirmed text after the user stops speaking or pauses for about 1 second).

The interim results are displayed immediately to give users visual feedback that their speech is being recognized. The user sees their words appearing on the screen as they speak, similar to live captioning. This creates a responsive, interactive experience.

Once the user finishes speaking or pauses for approximately 1 second, the interim results are converted to final results. The speech recognition stops automatically, and the final transcript is passed to the agent routing system.

**Configuration Details:**

The speech recognition is configured for continuous listening but stops after the user pauses (single-shot mode). It's set to capture interim results so users see live feedback. The language is set to English (US), though this can be configured for other languages.

### 2. **Transcript Processing & Agent Routing**

When the final transcript is received, the system must determine which agent should handle the command. The system uses pattern matching to route different types of queries:

- Queries about stock levels, SKUs, or inventory → **Inventory Manager**
- Questions about pricing, revenue, or profit → **Pricing Analyst**
- Questions about equipment, maintenance, or repairs → **Maintenance Coordinator**
- Queries about customer information or loyalty → **Customer Service Representative**
- Questions about deliveries, routes, or shipping → **Logistics Coordinator**

Once the appropriate agent (or agents) is identified, the system triggers the crew execution via the SSE streaming endpoint. As agents execute and produce output, their messages are captured and sent both to the UI for display and to the text-to-speech system for voice output.

### 3. **Voice Output: Text-to-Speech (TTS)**

The system uses the browser's native Speech Synthesis API to convert agent responses back into spoken audio. This creates a natural conversational loop where users can speak to the system and hear responses.

**Text-to-Speech Process:**

When agents produce output, that text is queued for speech synthesis. The system maintains a queue of messages waiting to be spoken because agents may produce output faster than the system can speak them. If multiple agents respond simultaneously, their messages are queued in the order they were received.

The system processes the queue sequentially, speaking one message at a time. While one agent's response is being spoken, other agent responses wait in the queue. This prevents overlapping audio and ensures clarity.

**Agent-Specific Voice Characteristics:**

Each agent is assigned specific voice characteristics to make them sound distinctive and memorable:

- **Inventory Manager:** Slightly higher pitch (1.1) and slower speaking rate (0.95) to sound authoritative and precise
- **Pricing Analyst:** Normal pitch (1.0) and normal rate (1.0) for standard professional tone
- **Maintenance Coordinator:** Deeper voice with lower pitch (0.9) and slower rate (0.9) to sound reliable and technical
- **Customer Service Representative:** Higher pitch (1.2) and slightly faster rate (1.05) to sound friendly and enthusiastic
- **Logistics Coordinator:** Moderate pitch (0.95) and faster rate (1.1) to sound efficient and action-oriented

When the system has multiple voices available, it assigns different voices to different agents to further enhance their distinctiveness.

### 4. **Muting and Voice Control**

Users can mute the voice output through a mute button in the interface. When muted, the system still processes text-to-speech requests but doesn't actually produce audio. Instead, it simulates the speech duration based on text length so the UI remains synchronized with what would have been spoken. This allows users to follow along visually without audio distraction.

---

## Shelf Monitor Feature

### Overview

The Shelf Monitor is a computer vision system that analyzes shelf images to detect issues, identify products, verify brand compliance, and generate actionable insights. This feature uses multiple AWS services to process images and provide real-time shelf health analysis.

### Image Processing Pipeline

The shelf monitoring process involves 10 sequential steps from image upload to actionable insights:

#### Step 1: Image Upload & Validation

Users upload shelf images through the web interface. The system validates that images meet quality requirements: minimum dimensions (at least 480x640 pixels), acceptable file format (JPEG or PNG), reasonable file size (under 10MB), and successful image parsing to ensure the file isn't corrupted.

#### Step 2: Backend Processing Preparation

The uploaded image is transferred to the backend FastAPI server. The backend creates a processing request, assigns a unique request ID, and prepares the image for analysis. The backend returns an immediate response indicating the request was accepted and will be processed asynchronously.

#### Step 3: AWS Rekognition Analysis

The image is sent to **Amazon Rekognition**, AWS's computer vision service. Rekognition analyzes the image to detect objects, brands, and other visual elements. For shelf monitoring, key detections include:

- Product packaging and labels
- Brand logos and signage
- Shelf organization and spacing
- Visible damage or deterioration
- Product groupings and dominance patterns
- Empty space areas
- Price tags and labels

Rekognition returns a list of detected labels with confidence scores indicating how certain it is about each detection.

#### Step 4: Textract OCR Extraction

The image is also sent to **Amazon Textract**, AWS's Optical Character Recognition service. Textract specializes in extracting text from images with high accuracy. For shelf monitoring, Textract extracts:

- Product names and descriptions
- Price information
- SKU numbers and barcodes
- Promotion banners and signs
- Quantity indicators
- Expiration dates (for perishables)
- Brand names and logos with text

Textract returns extracted text with bounding boxes indicating where text appeared in the image.

#### Step 5: Brand Detection & Mapping

The system combines Rekognition and Textract results to build a comprehensive map of brands present on the shelf. It identifies:

- Which brands are present
- How much shelf space each brand occupies (dominance percentage)
- Product count for each brand
- Whether brands are compliant with supplier contracts
- Competitor brand presence

This information is crucial for supplier compliance verification and retail compliance management.

#### Step 6: Issue Detection

The system analyzes the combined data to detect problems:

- **Damage Detection:** Identifying crushed boxes, spilled contents, or deteriorated packaging
- **Brand Dominance Violations:** When one brand occupies more than allowed shelf space
- **Empty Spaces:** Identifying gaps where products should be but aren't
- **Disorganization:** Detecting when similar products aren't grouped together
- **Expiration Issues:** Identifying potentially expired products based on date extraction
- **Pricing Inconsistencies:** Finding price mismatches or unlabeled products
- **Competitor Encroachment:** Detecting unexpected competitor products on your shelf

#### Step 7: AWS Bedrock AI Analysis

The detected issues and visual analysis are sent to **AWS Bedrock** (Claude or Nova model). The AI is prompted with detailed context about the shelf image, what was detected, what issues were found, and what the store's shelving standards are.

The AI generates:

- Root cause analysis (why are issues occurring?)
- Severity assessment (how urgent are the problems?)
- Recommended actions (what specific steps should staff take?)
- Predictive insights (what problems might develop if not addressed?)
- Optimization suggestions (how could shelf organization be improved?)

The AI synthesizes all information into human-readable actionable insights.

#### Step 8: Health Score Calculation

The system generates a health score from 0-100 representing overall shelf condition:

- **90-100 (Excellent):** Minimal or no issues, shelf fully compliant
- **70-89 (Good):** Minor issues, generally compliant
- **50-69 (Fair):** Moderate issues requiring attention
- **30-49 (Poor):** Multiple significant issues
- **0-29 (Critical):** Major issues requiring immediate intervention

The score is calculated based on:

- Number and severity of detected issues
- Compliance status with brand agreements
- Inventory coverage (percentage of shelf not empty)
- Organization and neatness
- Data freshness (older analysis scores lower than recent ones)

#### Step 9: DynamoDB Persistence

All analysis results are stored in **Amazon DynamoDB**, a serverless NoSQL database. The stored data includes:

- Original image metadata (upload time, store location, shelf ID)
- All Rekognition detections and confidence scores
- All Textract-extracted text
- Brand presence and dominance percentages
- Detected issues and their severity ratings
- Bedrock AI-generated insights
- Health score and timestamp
- Cost metadata for analytics

Data is stored with a Time-To-Live (TTL) attribute set to 90 days, meaning older analysis automatically deletes to control storage costs. This allows trending analysis while managing costs.

#### Step 10: S3 Image Storage

The original image and any processed/annotated versions are stored in **Amazon S3** for long-term archival and retrieval. The images are organized in a folder structure by store ID and date for easy access. Images older than 30 days are automatically transitioned to cheaper Glacier storage for long-term archival.

### Analytics & Trending Capabilities

Beyond single-image analysis, the system supports analytics queries:

- **Shelf Trend Analysis:** How has shelf health improved or degraded over time?
- **Issue Frequency:** What problems occur most frequently?
- **Brand Performance:** Which brands maintain better shelf presence?
- **Time of Day Patterns:** Are shelves better stocked at certain times?
- **Store Comparisons:** How does one store's shelf compliance compare to others?
- **Cost Impact:** What is the financial impact of shelf issues (lost sales, compliance violations)?

This data feeds back into the Inventory Manager and Pricing Analyst agents to inform their decisions.

---

## AWS Services & Integration Details

### 1. AWS Bedrock: Foundation Model Access

**What is Bedrock?**

AWS Bedrock is a managed service that provides serverless access to foundation models (large language models) from various providers including Anthropic (Claude), Amazon (Nova), and others. Rather than running your own LLM server, you send requests to Bedrock and pay per token used.

**How it's used in this project:**

The backend sends text prompts to Bedrock and receives generated responses. Bedrock powers both the agent system (agents use the LLM to decide which tools to call) and the shelf monitoring analysis (the LLM generates insights from shelf images).

**Cost Model:**

Bedrock uses pay-per-token pricing. For a typical agent execution with ~2,000 input tokens and ~500 output tokens, the cost is approximately:
- Amazon Nova Pro: ~$0.03 per execution
- Claude 3 Sonnet: ~$0.15 per execution

A store running agents 100 times daily would cost approximately:
- Amazon Nova: ~$90/month
- Claude 3 Sonnet: ~$450/month

**Requirements:**

- AWS account with Bedrock access in the region
- IAM permissions to invoke models
- Foundation model ID configured (model selection)

**Advantages:**

- No need to manage model infrastructure
- Automatic scaling and high availability
- Access to multiple models (easily switch between models)
- Built-in rate limiting and cost controls
- Enterprise security and compliance

### 2. Amazon Rekognition: Image Analysis & Brand Detection

**What is Rekognition?**

Amazon Rekognition is a computer vision service that analyzes images to detect objects, text, faces, activities, and much more. It uses deep learning models trained on billions of images.

**How it's used:**

For shelf monitoring, Rekognition analyzes shelf images to:
- Detect product packaging and organization
- Identify brand logos and signage
- Detect damage or unusual conditions
- Count visible products
- Identify competitor products

**Cost Model:**

Rekognition charges per image analyzed:
- Basic image analysis: ~$0.001 per image
- A store analyzing 20 shelf images daily: ~$6/month

**API Capabilities Used:**

- **DetectLabels:** Identifies objects and concepts in images
- **DetectText:** Finds and extracts text (though Textract is better)
- **DetectCustomLabels:** Uses custom-trained models to detect shelf-specific issues (optional)

**Advantages:**

- High accuracy on real-world retail images
- Very fast processing (<1 second per image)
- Handles varying lighting conditions
- Works with damaged or partial images
- Can be customized with training data

### 3. Amazon Textract: OCR & Text Extraction

**What is Textract?**

Amazon Textract automatically extracts text and structured data from images and PDFs using machine learning. It's more accurate than traditional OCR tools, especially for complex layouts.

**How it's used:**

For shelf monitoring, Textract extracts:
- Product names and SKUs
- Price information
- Brand names
- Promotional text
- Expiration dates
- Quantity indicators

**Cost Model:**

Textract charges per page:
- Document-level requests: ~$0.015 per page
- A store analyzing 20 shelf images daily: ~$9/month

**Advantages:**

- Higher accuracy than Rekognition's text detection
- Handles rotated or angled text
- Preserves document structure
- Fast processing
- Reliable for retail pricing and labeling

### 4. Amazon DynamoDB: Real-Time Data Storage

**What is DynamoDB?**

Amazon DynamoDB is a serverless NoSQL database that automatically scales to handle traffic. It's optimized for fast, consistent access to data.

**How it's used:**

DynamoDB stores:
- Current inventory levels by SKU
- Pricing information and adjustment history
- Equipment maintenance schedules
- Shelf analysis results and history
- Customer loyalty data
- Order and delivery information

**Data Schema:**

The system uses several tables:

- **Inventory Table:** Stores SKU-level inventory with columns for stock quantity, reorder threshold, supplier info, and last update timestamp
- **ShelfAnalysis Table:** Stores shelf monitoring results with image metadata, detected issues, health scores, and timestamps
- **Orders Table:** Tracks purchase orders with order ID, SKU, quantity, status, and dates
- **Equipment Table:** Stores equipment maintenance history with equipment ID, last service date, next scheduled maintenance, and condition status

**Cost Model:**

DynamoDB uses a pay-per-request model:
- Each write: ~$0.0000012 per item
- Each read: ~$0.00000025 per item
- A store with moderate usage: ~$5-20/month

**Advantages:**

- No server management needed
- Automatic scaling handles traffic spikes
- High availability across regions
- Nanosecond-level latency
- Built-in encryption and security
- Time-To-Live (TTL) for automatic data cleanup

### 5. Amazon S3: Long-Term Image Storage

**What is S3?**

Amazon S3 (Simple Storage Service) is object storage for any file type at scale. It's designed for durability, availability, and performance.

**How it's used:**

- Stores original shelf monitoring images
- Archives processed/annotated versions
- Stores agent execution logs
- Backs up analysis results

**Storage Organization:**

Images are organized as: `s3://bucket-name/store-{storeId}/shelf-monitoring/{date}/{timestamp}.jpg`

**Cost Model:**

S3 uses tiered storage pricing:
- Standard storage (0-30 days): ~$0.023 per GB/month
- Glacier (30+ days): ~$0.004 per GB/month
- A store storing 1GB of images monthly: ~$0.50/month

**Data Lifecycle:**

The system implements a lifecycle policy:
- Files < 30 days old: Stored in Standard tier (fast access)
- Files 30-90 days old: Transitioned to Glacier (lower cost, slower access)
- Files > 90 days old: Automatically deleted

**Advantages:**

- Extremely durable (99.999999999% durability)
- Automatically replicated across regions
- Integrated with other AWS services
- Searchable and queryable with S3 Select
- Versioning support for audit trails

### 6. AWS Step Functions: Workflow Orchestration

**What is Step Functions?**

AWS Step Functions is a service for coordinating workflows across AWS services. It manages the execution flow, retries, error handling, and state management.

**Potential Use Cases:**

While the current implementation uses CrewAI for agent orchestration, Step Functions could be used for:

- Orchestrating shelf image analysis pipeline (upload → Rekognition → Textract → Bedrock → DynamoDB → S3)
- Coordinating complex business workflows across multiple services
- Handling retries and failure recovery
- Managing timeouts and long-running operations
- Creating audit trails of execution

**Why Consider Step Functions:**

- Visual workflow representation and monitoring
- Built-in error handling and retries
- Timeout protection (prevents infinite loops)
- Cost tracking per workflow
- Integration with native AWS services
- CloudWatch logging and monitoring

### 7. AWS IoT Core: Edge Device Integration (Optional)

**What is IoT Core?**

AWS IoT Core enables connectivity between internet-of-things devices (sensors, cameras, etc.) and AWS cloud services.

**Potential Use Cases:**

- Real-time shelf sensors reporting product levels
- Smart camera systems continuously monitoring shelves
- Temperature and humidity sensors in refrigerated sections
- Equipment sensors reporting maintenance alerts
- Point-of-sale system integration for real-time sales data

**How it could integrate:**

IoT devices could publish data to MQTT topics, which triggers Lambda functions that update DynamoDB and invoke Bedrock agents with real-time data. This would enable fully autonomous store operations without requiring manual image uploads.

### Service Integration Summary Table

| Service | Purpose | Cost (100 ops/day) | Primary Data Flow |
|---------|---------|-------------------|------------------|
| Bedrock | AI reasoning & insights | $90-450/month | Prompts → Insights |
| Rekognition | Image analysis | $30/month | Images → Labels |
| Textract | Text extraction | $45/month | Images → Text |
| DynamoDB | Data storage | $5-20/month | Structured data |
| S3 | Image archival | $0.50/month | Images → Archive |
| Step Functions | Workflow orchestration | Variable | Event routing |
| IoT Core | Edge integration | Optional | Device → Cloud |

**Total Monthly Cost for Small Store:** ~$150-$500/month depending on operational volume and service tier choices.

---

## System Architecture

### Complete System Flow

The entire system works through a well-coordinated sequence of interactions:

**1. User Interaction (Frontend)**

Users access the system through a web browser running the Next.js application. They can interact with the system through either text commands or voice commands. For voice input, users click a microphone button which activates the browser's speech recognition. For text input, they type directly into command fields.

**2. Command Reception & Routing**

The frontend captures either spoken or typed commands and routes them to the appropriate destination:

- For agent commands: Triggers the FastAPI backend's `/stream-crew` endpoint
- For shelf analysis: Uploads images to `/api/shelf-share/analyze` endpoint
- For customer queries: Routes to the Customer Service agent

**3. Agent Execution (Backend)**

The FastAPI backend receives commands and orchestrates agent execution using CrewAI:

1. Parses the user command to understand intent
2. Initializes the Bedrock language model with AWS credentials
3. Creates the agent constellation (all 5 agents with their tools)
4. Executes agents sequentially, each building on previous results
5. Streams execution logs back to the frontend via SSE
6. Stores results in DynamoDB for audit and analytics

**4. Agent-to-Service Communication**

As agents execute, they call various AWS services:

- **Agents query DynamoDB** for current inventory, customer data, and equipment status
- **Bedrock LLM** analyzes the data and decides which tools to call
- **Agents update DynamoDB** with decisions (price changes, maintenance schedules)
- **Agents read from S3** for historical context and past analysis

**5. Shelf Monitoring Pipeline**

For shelf monitoring operations:

1. User uploads image through web interface
2. Backend receives image and validates it
3. Backend sends image to **Rekognition** for visual analysis
4. Backend sends image to **Textract** for text extraction
5. Backend synthesizes results and sends to **Bedrock** for AI insights
6. Backend stores all analysis results in **DynamoDB**
7. Backend stores original image in **S3**
8. Backend returns analysis to frontend for display

**6. Voice Response Loop**

For voice interactions:

1. Agent execution produces text output
2. Frontend captures agent responses via SSE stream
3. Frontend queues messages for text-to-speech
4. Browser's Speech Synthesis API converts text to audio
5. User hears agent responses with distinctive voice characteristics
6. User can respond with voice, creating conversational loop

### Multi-Tier Architecture

**Presentation Tier (Frontend):**
- Next.js application running in browser
- Real-time UI updates via SSE streams
- Voice interface with Web Speech APIs
- Image upload and display
- Real-time agent constellation visualization

**Application Tier (Backend):**
- FastAPI server orchestrating requests
- CrewAI managing agent lifecycle
- Bedrock language model access
- Tool execution and result aggregation
- SSE streaming for real-time updates

**Data Tier (AWS Services):**
- DynamoDB for operational data and analysis results
- S3 for image archival and long-term storage
- Rekognition and Textract for image processing
- Bedrock for AI analysis and reasoning

**External Services:**
- AWS IAM for authentication and authorization
- CloudWatch for logging and monitoring
- AWS SDK for service integration

---

## Deployment & Configuration

### Environment Variables

The system requires several environment variables for proper operation:

**AWS Credentials:**
- AWS_REGION: The AWS region (e.g., "us-east-1")
- AWS_ACCESS_KEY_ID: AWS IAM user access key
- AWS_SECRET_ACCESS_KEY: AWS IAM user secret key

**Service Configuration:**
- BEDROCK_MODEL_ID: The model ID to use (e.g., "amazon.nova-pro-v1:0")
- DYNAMODB_TABLE_INVENTORY: Name of inventory table
- DYNAMODB_TABLE_SHELF_ANALYSIS: Name of shelf analysis table
- S3_BUCKET_IMAGES: S3 bucket for image storage

**Application Configuration:**
- API_PORT: Port for FastAPI server (default: 8000)
- STORE_ID: Default store identifier
- LOG_LEVEL: Logging verbosity (DEBUG, INFO, WARNING)

### IAM Permissions Required

The AWS IAM user running this application needs permissions for:

**Bedrock:**
- bedrock:InvokeModel
- bedrock:GetFoundationModelAvailability

**DynamoDB:**
- dynamodb:GetItem
- dynamodb:PutItem
- dynamodb:Query
- dynamodb:Scan
- dynamodb:UpdateItem

**S3:**
- s3:PutObject
- s3:GetObject
- s3:ListBucket

**Rekognition:**
- rekognition:DetectLabels
- rekognition:DetectText
- rekognition:DetectCustomLabels (if using custom models)

**Textract:**
- textract:DetectDocumentText
- textract:AnalyzeDocument

### Database Initialization

Before deploying, the following DynamoDB tables must be created:

**Inventory Table:**
- Primary key: SKU (string)
- Attributes: quantity, reorderThreshold, supplier, lastUpdated
- TTL: Not required (data retained indefinitely)

**ShelfAnalysis Table:**
- Primary key: analysisId (string)
- Sort key: timestamp (number)
- Attributes: storeId, imageUrl, issues, healthScore, bedRockInsights
- TTL: 90 days (automatic cleanup)

**Orders Table:**
- Primary key: orderId (string)
- Attributes: sku, quantity, status, createdDate, expectedDelivery

**Equipment Table:**
- Primary key: equipmentId (string)
- Attributes: location, maintenanceStatus, lastServiceDate, nextServiceDate

### Scaling Considerations

**For Small Stores (1-3 stores, <100 ops/day):**
- DynamoDB: On-demand billing model
- Bedrock: Pay-per-token (cost-effective at low volume)
- S3: Lifecycle policies to archive after 30 days
- Estimated cost: $150-250/month

**For Medium Chains (10-50 stores, 1,000+ ops/day):**
- DynamoDB: Provisioned capacity with autoscaling
- Bedrock: Cost optimization through request batching
- S3: Enhanced lifecycle policies and Intelligent Tiering
- CloudWatch monitoring for all services
- Estimated cost: $500-1,500/month

**For Large Chains (100+ stores, 10,000+ ops/day):**
- DynamoDB: Dedicated capacity and global tables
- Bedrock: Provisioned throughput contracts
- S3: Multi-region replication for disaster recovery
- Step Functions for complex workflow orchestration
- Lambda for serverless compute tasks
- EventBridge for event-driven architecture
- Estimated cost: $2,000-5,000/month

### Monitoring & Observability

The system should be monitored using:

- **CloudWatch Logs:** Application and agent execution logs
- **CloudWatch Metrics:** API response times, error rates, service latency
- **CloudWatch Alarms:** Alert on error spikes, latency increases, cost overages
- **X-Ray Tracing:** End-to-end request tracing through services
- **Cost Explorer:** Track spending across AWS services
- **Health Dashboards:** Real-time service health status

### Security Best Practices

1. **IAM Least Privilege:** Grant only necessary permissions
2. **Encryption:** Enable encryption at rest (DynamoDB, S3) and in transit (HTTPS)
3. **Key Management:** Use AWS Secrets Manager for credential rotation
4. **Network:** Deploy in VPC with security groups and NACLs
5. **Audit:** Enable CloudTrail logging for all API calls
6. **Data Protection:** Implement row-level security in DynamoDB (optional)
7. **API Security:** Add rate limiting and request validation

---

## Conclusion

AWS-AgenticAI represents a next-generation approach to retail store operations management. By combining AWS Bedrock's powerful foundation models with specialized AI agents, computer vision, and voice interfaces, the system enables stores to operate more efficiently, reduce costs, improve compliance, and enhance customer experiences.

The modular architecture allows for easy extension: additional agents can be added for new business domains, new tools can be integrated as business needs evolve, and new AWS services can be incorporated as capabilities expand.

The use of serverless services (Bedrock, Rekognition, Textract, DynamoDB, S3) ensures the system scales automatically with demand, charges only for actual usage, and requires minimal operational overhead.
