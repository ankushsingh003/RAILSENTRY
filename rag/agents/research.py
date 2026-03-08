from rag.agents.memory import get_past_context

async def research_agent(state: AgentState):
    """Queries Vector DB for relevant SOPs and checks memory."""
    vector_db = get_vector_db()
    parsed = state["parsed_anomaly"]
    segment = parsed['segment']
    
    query = f"Repair SOP for {parsed['cause']} with {parsed['severity']} severity at {segment}"
    docs = vector_db.similarity_search(query, k=2)
    
    # New: Add memory context
    history = get_past_context(segment)
    
    state["research_results"] = "\n".join([d.page_content for d in docs])
    state["past_history"] = history
    
    print(f"--- Research Agent: Found SOPs & History ---")
    return state
