from .base import AgentState, get_vector_db

vector_db = get_vector_db()

def research_agent(state: AgentState):
    """Queries Vector DB for relevant SOPs."""
    parsed = state["parsed_anomaly"]
    query = f"Repair SOP for {parsed['cause']} with {parsed['severity']} severity at {parsed['segment']}"
    docs = vector_db.similarity_search(query, k=2)
    state["research_results"] = "\n".join([d.page_content for d in docs])
    print(f"--- Research Agent: Found SOPs ---")
    return state
