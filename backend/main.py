import sys
import os

# Absolute project root
ROOT_DIR = r"d:\full_stack_ml"
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from rag.agents import run_kavach_agent_legacy, stream_kavach_agent
from typing import List, Dict
from fastapi.responses import StreamingResponse

app = FastAPI(title="Kavach-GenAI Backend API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
LOG_FILE = r"d:\full_stack_ml\data\logs\event_logs.txt"
PROCESSED_DATA_FILE = r"d:\full_stack_ml\data\processed\train_railway.csv"

@app.get("/")
async def root():
    return {"message": "Kavach-GenAI API is running"}

@app.get("/alerts")
async def get_alerts():
    """Returns the latest anomaly alerts from the ML model."""
    if not os.path.exists(LOG_FILE):
        return {"alerts": []}
    
    with open(LOG_FILE, "r") as f:
        logs = f.readlines()
    
    # Format logs into a list of objects
    alerts = []
    for i, log in enumerate(reversed(logs)):
        if log.strip():
            alerts.append({
                "id": i,
                "message": log.strip(),
                "timestamp": pd.Timestamp.now().isoformat() # Mock timestamp
            })
    return {"alerts": alerts}

@app.post("/analyze")
async def analyze_alert(alert: Dict[str, str]):
    """Invokes the Agentic RAG system for a specific alert."""
    try:
        log_message = alert.get("message")
        if not log_message:
            raise HTTPException(status_code=400, detail="Alert message is required")
        
        advice = await run_kavach_agent_legacy(log_message)
        return {"advice": advice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze_stream")
async def analyze_alert_stream(alert: Dict[str, str]):
    """Streams the Agentic RAG reasoning process."""
    log_message = alert.get("message")
    if not log_message:
        raise HTTPException(status_code=400, detail="Alert message is required")
    
    return StreamingResponse(
        stream_kavach_agent(log_message),
        media_type="text/event-stream"
    )

@app.get("/historical_data")
async def get_historical_data():
    """Returns historical sensor data for visualization."""
    if not os.path.exists(PROCESSED_DATA_FILE):
        return {"data": []}
    
    df = pd.read_csv(PROCESSED_DATA_FILE).head(100)
    return {"data": df.to_dict(orient="records")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
