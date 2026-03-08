from rag.agents.base import AgentState, get_llm

async def planning_agent(state: AgentState):
    """Suggests maintenance depot and tools."""
    llm = get_llm()
    parsed = state["parsed_anomaly"]
    sop = state["research_results"]
    history = state.get("past_history", "")
    critique = state.get("critique", "")
    
    prompt = f"""Based on this anomaly: {parsed} and these SOPs: {sop}, 
    Suggest the nearest maintenance depot, required tools, and a step-by-step repair plan.
    Refer to the Northern Plains (Delhi, Kanpur, Nagpur) or Western Ghats (Karjat, Lonavala) as per the segment.
    
    HISTORICAL CONTEXT: {history}
    PREVIOUS CRITIQUE (if any): {critique}
    
    If there is a critique, address it specifically in your improved plan.
    You may use tools if you need current inventory data."""
    
    response = await llm.ainvoke(prompt)
    state["maintenance_plan"] = response.content
    print(f"--- Planning Agent: Created/Refined Plan ---")
    return state
