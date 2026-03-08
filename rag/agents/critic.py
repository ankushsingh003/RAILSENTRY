from .base import AgentState, get_llm

async def critic_agent(state: AgentState):
    """Audits the maintenance plan for potential flaws or safety risks."""
    llm = get_llm()
    plan = state["maintenance_plan"]
    sop = state["research_results"]
    
    prompt = f"""You are the RailSentry Senior Auditor. 
    Audit this maintenance plan: {plan}
    Against these SOPs: {sop}
    
    If the plan is missing specific tools, underestimating urgency, or ignoring safety protocols, 
    provide a CRITIQUE. If it is perfect, output 'APPROVED'.
    
    Keep your critique technical and concise."""
    
    response = await llm.ainvoke(prompt)
    critique = response.content
    
    state["critique"] = critique
    state["iteration"] = state.get("iteration", 0) + 1
    
    print(f"--- Critic Agent: Iteration {state['iteration']} ---")
    return state
