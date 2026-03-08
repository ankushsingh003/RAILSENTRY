import json
from rag.agents.base import AgentState, get_llm

async def ingestion_agent(state: AgentState):
    """Parses the raw ML event log."""
    llm = get_llm()
    report = state["anomaly_report"]
    prompt = f"Parse this railway anomaly report into a JSON format with keys: segment, vibration_score, cause, severity.\nReport: {report}. Return ONLY JSON."
    response = await llm.ainvoke(prompt)
    
    content = response.content
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    
    state["parsed_anomaly"] = json.loads(content)
    print(f"--- Ingestion Agent: Parsed Anomaly ---")
    return state
