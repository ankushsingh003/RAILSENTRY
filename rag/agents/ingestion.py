import json
from .base import AgentState, get_llm

llm = get_llm()

def ingestion_agent(state: AgentState):
    """Parses the raw ML event log."""
    report = state["anomaly_report"]
    prompt = f"Parse this railway anomaly report into a JSON format with keys: segment, vibration_score, cause, severity.\nReport: {report}"
    response = llm.invoke(prompt)
    
    content = response.content
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    
    state["parsed_anomaly"] = json.loads(content)
    print(f"--- Ingestion Agent: Parsed Anomaly ---")
    return state
