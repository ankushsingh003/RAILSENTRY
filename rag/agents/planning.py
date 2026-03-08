from rag.agents.base import AgentState, get_llm

def planning_agent(state: AgentState):
    """Suggests maintenance depot and tools."""
    llm = get_llm()
    parsed = state["parsed_anomaly"]
    sop = state["research_results"]
    prompt = f"""Based on this anomaly: {parsed} and these SOPs: {sop}, 
    Suggest the nearest maintenance depot, required tools, and a step-by-step repair plan.
    Refer to the Northern Plains (Delhi, Kanpur, Nagpur) or Western Ghats (Karjat, Lonavala) as per the segment."""
    response = llm.invoke(prompt)
    state["maintenance_plan"] = response.content
    print(f"--- Planning Agent: Created Plan ---")
    return state
