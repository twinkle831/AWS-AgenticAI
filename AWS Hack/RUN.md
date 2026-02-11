# How to Run — Agentic Store Operations (Hackathon Demo)

Everything runs on **AWS** — no OpenAI API key. Use your **AWS account** and **AWS CLI**.

---

## 1. Prerequisites

- **Python 3.10+** installed
- **AWS account** with **AWS CLI** configured: `aws configure`
- **Bedrock access**: enable a model (e.g. Claude) in the AWS Console once (see below)

---

## 2. One-time: Enable Bedrock in AWS

The agents use **Amazon Bedrock** for the LLM. You need to turn it on once:

1. Open **AWS Console** → **Amazon Bedrock** (search in the top bar).
2. In the left menu, open **Model access** (or **Get started**).
3. **Enable** the model you want (e.g. **Claude 3 Haiku** or **Claude 3 Sonnet**).  
   The app uses **Claude 3 Haiku** by default (`anthropic.claude-3-haiku-20240307-v1:0`).
4. Pick the same **region** you use for CLI (e.g. `us-east-1`). Set it with `aws configure` or `AWS_REGION` in `.env`.

---

## 3. One-time setup (project)

### 3.1 Open the project folder

```powershell
cd "c:\Users\Dhingra\AWS Hack"
```

### 3.2 Create and activate a virtual environment

```powershell
python -m venv .venv
.venv\Scripts\activate
```

You should see `(.venv)` in your prompt.

### 3.3 Install dependencies

```powershell
pip install -r requirements.txt
```

### 3.4 Configure AWS (if not already)

```powershell
aws configure
```

Enter your **Access Key ID**, **Secret Access Key**, and **Region** (e.g. `us-east-1`).  
Optional: copy `.env.example` to `.env` and set `AWS_REGION` or `AWS_PROFILE` if you use a named profile.

### 3.5 Deploy AWS resources (first time only)

Creates DynamoDB tables, Step Functions state machine, and IoT policy:

```powershell
python scripts/deploy_aws.py --seed
```

`--seed` adds sample inventory, equipment, and customers so the crew has data to work with.

---

## 4. Run the app (website + API)

Start the server (serves both the **website** and the **API**):

```powershell
python api_server.py
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 5. Open the demo website

In your browser go to:

**http://localhost:8000**

You’ll see the **StoreOps** dashboard:

- **Run AI Crew** — runs all 5 agents using **AWS Bedrock** (no OpenAI key).
- **Start workflow** — starts the Step Functions workflow.
- **Low stock** — refresh to see items from DynamoDB.
- **Crew output** — result after you click “Run crew”.

---

## 6. Demo flow for the hackathon

1. **Show the dashboard** — open http://localhost:8000 and explain the 5 agents.
2. **Refresh Low stock** — click “Refresh” to show DynamoDB data.
3. **Run AI Crew** — click “Run crew”. Wait 1–2 minutes. Show the **Crew output**.
4. **Start workflow** — click “Start workflow” to show Step Functions.
5. **(Optional)** In AWS Console, show DynamoDB tables and Step Functions.

---

## 7. Troubleshooting

| Issue | What to do |
|--------|------------|
| “API offline” on the site | Start the server: `python api_server.py` |
| “AWS credentials required” when running crew | Run `aws configure` or set `AWS_REGION` / `AWS_PROFILE` in `.env` |
| Bedrock / model access error | In AWS Console → Bedrock → Model access, enable Claude 3 Haiku (or set `BEDROCK_MODEL_ID` to an enabled model) |
| Wrong region | Use same region in `aws configure` and in Bedrock (e.g. `us-east-1`) |
| “Could not start workflow” | Run `python scripts/deploy_aws.py` and ensure AWS CLI is configured |
| Low stock list empty | Run `python scripts/deploy_aws.py --seed` |
| Port 8000 in use | In `api_server.py` change port, e.g. `uvicorn.run(app, host="0.0.0.0", port=8080)` |

---

## 8. Optional: run crew from command line

```powershell
python run_crew.py
```

---

## 9. Optional: simulate IoT events

If you have an IoT thing and attached the policy from `deploy_aws.py`:

```powershell
python scripts/simulate_iot_events.py
```

---

**Quick recap:**  
`aws configure` → enable Bedrock model in console → `pip install -r requirements.txt` → `python scripts/deploy_aws.py --seed` → `python api_server.py` → open **http://localhost:8000**.
