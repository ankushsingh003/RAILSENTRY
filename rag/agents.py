from langgraph.graph import StateGraph, END
from .agents.base import AgentState
from .agents.ingestion import ingestion_agent
from .agents.research import research_agent
from .agents.planning import planning_agent
from .agents.validation import validation_agent

# --- Graph Orchestration ---

workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("ingestion", ingestion_agent)
workflow.add_node("research", research_agent)
workflow.add_node("planning", planning_agent)
workflow.add_node("validation", validation_agent)

# Set Entry Point
workflow.set_entry_point("ingestion")

# Edge logic
workflow.add_edge("ingestion", "research")
workflow.add_edge("research", "planning")
workflow.add_edge("planning", "validation")
workflow.add_edge("validation", END)

# Compile
app = workflow.compile()

def run_kavach_agent(log_report: str):
    inputs = {"anomaly_report": log_report}
    output = app.invoke(inputs)
    return output["final_advice"]

if __name__ == "__main__":
    # Test with a mock log
    sample_log = "[Anomaly Detected: Segment-1, Vibration Score: 0.82, Probable Cause: High Vibration / Track Defect, Severity: High]"
    print(f"Processing Log: {sample_log}")
    advice = run_kavach_agent(sample_log)
    print("\n=== FINAL AI ADVICE ===\n")
    print(advice)
