import os
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.messages import BaseMessage, HumanMessage, AIChatMessage

# --- State Definition ---
class AgentState(TypedDict):
    anomaly_report: str
    parsed_anomaly: dict
    research_results: str
    maintenance_plan: str
    validation_status: str
    final_advice: str

# --- Components ---
# Initialize LLM (Ensure GOOGLE_API_KEY is in your environment)
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro")

# Load Vector DB
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_db = FAISS.load_local(r"d:\full_stack_ml\rag\vector_db", embeddings, allow_dangerous_deserialization=True)

# --- Agent Nodes ---

def ingestion_agent(state: AgentState):
    """Parses the raw ML event log."""
    report = state["anomaly_report"]
    prompt = f"Parse this railway anomaly report into a JSON format with keys: segment, vibration_score, cause, severity.\nReport: {report}"
    response = llm.invoke(prompt)
    # Mock parsing for simplicity, in real case use JsonOutputParser
    import json
    # Attempting to extract JSON from markdown response
    content = response.content
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    state["parsed_anomaly"] = json.loads(content)
    print(f"--- Ingestion Agent: Parsed Anomaly ---")
    return state

def research_agent(state: AgentState):
    """Queries Vector DB for relevant SOPs."""
    parsed = state["parsed_anomaly"]
    query = f"Repair SOP for {parsed['cause']} with {parsed['severity']} severity at {parsed['segment']}"
    docs = vector_db.similarity_search(query, k=2)
    state["research_results"] = "\n".join([d.page_content for d in docs])
    print(f"--- Research Agent: Found SOPs ---")
    return state

def planning_agent(state: AgentState):
    """Suggests maintenance depot and tools."""
    parsed = state["parsed_anomaly"]
    sop = state["research_results"]
    prompt = f"""Based on this anomaly: {parsed} and these SOPs: {sop}, 
    Suggest the nearest maintenance depot, required tools, and a step-by-step repair plan.
    Refer to the Northern Plains (Delhi, Kanpur, Nagpur) or Western Ghats (Karjat, Lonavala) as per the segment."""
    response = llm.invoke(prompt)
    state["maintenance_plan"] = response.content
    print(f"--- Planning Agent: Created Plan ---")
    return state

def validation_agent(state: AgentState):
    """Checks compliance with 2026 Safety Circulars."""
    plan = state["maintenance_plan"]
    sop = state["research_results"]
    prompt = f"""Review this maintenance plan: {plan}
    Against these safety protocols: {sop}
    Verify if it complies with '2026 Safety Circulars' which require safety agent validation and specific speed limits.
    Output a 'VALIDATED' or 'REJECTED' status followed by the final refined advice."""
    response = llm.invoke(prompt)
    state["final_advice"] = response.content
    print(f"--- Validation Agent: Finalized Advice ---")
    return state

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
