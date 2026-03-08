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
        INF --> LOGS[Anomaly Event Logs]
    end

    subgraph "Backend API (FastAPI)"
        LOGS --> API[FastAPI Server]
        API --> AUTH[Auth & Context]
    end

    subgraph "Agentic RAG Layer (LangGraph)"
        API --> AGENTS[RailSentry Agents]
        AGENTS --> KB[(Vector DB: IRPWM Manuals)]
        AGENTS --> LLM[Gemini 1.5 Pro]
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
    participant B as Backend API
    participant A as RailSentry Agents
    participant V as Vector DB (SOPs)

    S->>M: Continuous Telemetry
    M->>M: Detect Anomaly
    M->>B: Generate Event Log
    B->>B: Post to Live Feed
    Note over B,A: User selects alert in Dashboard
    B->>A: Invoke Agent Pipeline
    A->>V: Research Agent: Query IRPWM Manuals
    V-->>A: Retrieve relevant SOPs & Manuals
    A->>A: Planning Agent: Draft Repair SOP
    A->>A: Validation Agent: Check 2026 Safety Circulars
    A-->>B: Return Refined Expert Advice
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
