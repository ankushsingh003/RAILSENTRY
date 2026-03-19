# 📡 RailSentry AI: Next-Gen Railway Asset Guardian

**RailSentry AI** is a premium, industry-grade intelligent system designed to monitor Indian Railway assets using Machine Learning and provide expert maintenance consultancy through an Agentic RAG (Retrieval-Augmented Generation) system.

## 🚀 Overview

The project addresses critical railway safety priorities by:
1.  **Predicting Failures**: Using a trained LSTM model to detect anomalies (vibration, heat, wear) in real-time.
2.  **Reasoning with Expertise**: A multi-agent system (Gemini 1.5 Pro) that consults IRPWM safety manuals and SOPs.
3.  **Elite Dashboarding**: A high-fidelity, corporate-aesthetic cockpit built with **React, TypeScript, and Framer Motion**.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph "Edge / Sensor Layer"
        S1[Vibration Sensors] --> DC[Data Collection]
        S2[Thermal Sensors] --> DC
        S3[Acoustic Sensors] --> DC
    end

    subgraph "ML Core (PyTorch)"
        DC --> INF[LSTM Inference Engine]
        INF --> LOGS[(event_logs.txt)]
    end

    subgraph "Backend API (FastAPI)"
        LOGS --> API[FastAPI Server]
        API --> STREAM[Streaming Response /SSE]
    end

    subgraph "Agentic RAG Layer (LangGraph)"
        STREAM --> ORCH[Workflow Orchestrator]
        subgraph "Multi-Agent Pipeline"
            ORCH --> IG[Ingestion Agent]
            IG --> RS[Research Agent]
            RS --> PL[Planning Agent]
            PL <--> CR[Critic Agent]
            CR --> VL[Validation Agent]
        end
        RS --> KB[(Vector DB: IRPWM Manuals)]
        Multi-Agent Pipeline --> LLM[Gemini 1.5 Pro]
    end

    subgraph "Frontend Cockpit (React/TS)"
        API <--> DASH[Premium Dashboard]
    end
```

---

## 🔄 Operation Workflow

When an anomaly is detected, the **RailSentry AI** advisor follows this orchestrated path:

```mermaid
sequenceDiagram
    participant S as Sensors
    participant M as LSTM Model
    participant B as Backend (FastAPI)
    participant O as LangGraph Orchestrator
    participant A as Specialist Agents
    participant V as Vector DB (SOPs)

    S->>M: Continuous Telemetry
    M->>M: Detect Anomaly
    M->>B: Log Event to event_logs.txt
    B->>B: `/alerts` endpoint active
    Note over B,O: User triggers /analyze_stream
    B->>O: Start Agentic Pipeline
    O->>A: [Ingestion] Process Log Context
    A->>V: [Research] Query IRPWM Manuals
    V-->>A: Retrieve relevant SOPs
    loop Refinement Cycle
        A->>A: [Planning] Draft Maintenance SOP
        A->>A: [Critic] Audit & Feedback
    end
    A->>A: [Validation] Final Safety Check
    A-->>B: Stream SSE Events (status, node, token)
    B-->>B: Render in Intelligent Advisor Panel
```

---

## 🛠️ Key Features

- **Deep Space UI**: A premium dark-theme interface with custom glassmorphism and ambient glowing accents.
- **24-Hour Telemetry**: Real-time visualization of vibration, axle temperature, and bearing wear.
- **Segment Health Index**: Real-time status monitoring of structural integrity across geographical zones.
- **Agentic Pipeline**: Multi-step reasoning (Ingestion → Research → Planning → Validation) for safe maintenance.

---

## 🚦 Getting Started

### 1. Backend Setup
```powershell
# Root Directory
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
# Set your Gemini API Key
$env:GOOGLE_API_KEY = "your_key"
python backend/main.py
```

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
├── backend/               # FastAPI API Layer
├── frontend/              # Premium React + TypeScript Dashboard
├── rag/                   # Agentic RAG System
│   ├── agents/            # Multi-Agent Workflow Core
│   └── vector_db/         # FAISS Index of Technical Manuals
├── ml/                    # Machine Learning Pipeline
│   ├── models/            # LSTM Model Weights
│   └── inference.py       # Live Data Stream Simulation
└── data/                  # Source manuals and generated logs
```
