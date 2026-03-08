from rag.agents.base import AgentState, get_llm

def validation_agent(state: AgentState):
    """Checks compliance with 2026 Safety Circulars."""
    llm = get_llm()
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
