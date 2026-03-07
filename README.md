# 🏗️ Kavach-GenAI: Intelligent Rail Asset Guardian

**Kavach-GenAI** is an industry-grade intelligent system designed to monitor Indian Railway assets using Machine Learning and provide expert maintenance consultancy through an Agentic RAG (Retrieval-Augmented Generation) system.

## 🚀 Overview

The project addresses critical railway safety priorities by:
1.  **Predicting Failures**: Using a trained LSTM model to detect anomalies (vibrations, overheating, wear) in railway tracks and rolling stock.
2.  **Reasoning with Expertise**: Leveraging an Agentic Workflow (LangGraph) that queries official Indian Railways technical manuals (IRPWM, SOPs) to suggest repair plans.
3.  **Modern Dashboarding**: A high-end, industry-standard dashboard built with **React, TypeScript, and Tailwind CSS**.

---

## 🛠️ Architecture

### 1. ML Training Layer (The Data Generator)
- **Model**: LSTM-based Anomaly Detection (built with PyTorch).
- **Function**: Processes raw sensor data and generates structured "Event Logs".

### 2. Agentic RAG Layer (The Reasoning Engine)
A modular LangGraph-based system featuring:
- **Ingestion, Research, Planning, and Validation Agents**.
- **Vector DB**: Local FAISS index containing IR technical manuals.

### 3. Backend API
- **Tech Stack**: FastAPI (Python).
- **Function**: Serves as the bridge between the Python ML/RAG logic and the TypeScript frontend.

### 4. Frontend Dashboard
- **Tech Stack**: React + Vite + TypeScript + Tailwind CSS.
- **UI/UX**: Premium dark-mode aesthetic with real-time alert cards and interactive AI advice panels.

---

## 🚦 Getting Started

### 1. Backend Setup
```powershell
# In the root directory
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
pip install fastapi uvicorn
$env:GOOGLE_API_KEY = "your_google_ai_studio_api_key_here"
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
├── frontend/              # React + Vite + TypeScript Dashboard
├── rag/
│   ├── agents/            # Modular LangGraph Agents (Ingestion, Research, etc.)
│   ├── vector_db/         # FAISS Vector Index
├── ml/
│   ├── models/            # Trained PyTorch model weights
├── data/
│   ├── manuals/           # IR Technical Manuals
│   └── logs/              # Generated ML Event Logs
└── README.md
```
