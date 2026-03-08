import json
from rag.agents.base import AgentState, get_llm

async def ingestion_agent(state: AgentState):
    """Parses the raw ML event log."""
    llm = get_llm()
    report = state["anomaly_report"]
    prompt = f"Parse this railway anomaly report into a JSON format with keys: segment, vibration_score, cause, severity.\nReport: {report}. Return ONLY JSON."
    response = await llm.ainvoke(prompt)
    
    content = response.content
    # More robust JSON extraction
    if "```" in content:
        content = content.replace("```json", "").replace("```", "").strip()
    
    try:
        state["parsed_anomaly"] = json.loads(content)
    except Exception as e:
        print(f"Warning: JSON parse failed. Raw: {content}")
        # Manual fallback for common keys
        state["parsed_anomaly"] = {
            "segment": "Unknown", "cause": "Unknown", "severity": "Medium", "vibration_score": 0.5
        }
    print(f"--- Ingestion Agent: Parsed Anomaly ---")
    return state
