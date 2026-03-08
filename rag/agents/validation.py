from rag.agents.memory import save_to_memory

async def validation_agent(state: AgentState):
    """Checks compliance and persists to memory."""
    llm = get_llm()
    plan = state["maintenance_plan"]
    sop = state["research_results"]
    parsed = state["parsed_anomaly"]
    
    prompt = f"""Review this maintenance plan: {plan}
    Against these safety protocols: {sop}
    Verify if it complies with '2026 Safety Circulars'.
    Output a 'VALIDATED' or 'REJECTED' status followed by the final refined advice."""
    
    response = await llm.ainvoke(prompt)
    final_advice = response.content
    state["final_advice"] = final_advice
    
    # New: Persist to memory if validated
    if "VALIDATED" in final_advice.upper():
        save_to_memory(parsed["segment"], parsed["cause"], final_advice)
        
    print(f"--- Validation Agent: Finalized & Remembered ---")
    return state
