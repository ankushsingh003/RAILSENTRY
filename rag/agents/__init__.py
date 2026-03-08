from langgraph.graph import StateGraph, END
from .base import AgentState
from .ingestion import ingestion_agent
from .research import research_agent
from .planning import planning_agent
from .validation import validation_agent
from .critic import critic_agent

# --- Graph Orchestration ---

workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("ingestion", ingestion_agent)
workflow.add_node("research", research_agent)
workflow.add_node("planning", planning_agent)
workflow.add_node("critic", critic_agent)
workflow.add_node("validation", validation_agent)

# Set Entry Point
workflow.set_entry_point("ingestion")

# Edge logic
workflow.add_edge("ingestion", "research")
workflow.add_edge("research", "planning")
workflow.add_edge("planning", "critic")

# Conditional debate loop
def should_continue(state: AgentState):
    critique = state.get("critique", "").upper()
    iteration = state.get("iteration", 0)
    
    if "APPROVED" in critique or iteration >= 3:
        return "validate"
    return "refine"

workflow.add_conditional_edges(
    "critic",
    should_continue,
    {
        "validate": "validation",
        "refine": "planning"
    }
)

workflow.add_edge("validation", END)

# Compile
app = workflow.compile()

async def stream_kavach_agent(log_report: str):
    """
    Streams events from the agentic workflow.
    Yields JSON-formatted events for the frontend.
    """
    import json as _json

    def sse(type_: str, content: str) -> str:
        """Safe SSE line using json.dumps to escape all special characters."""
        return f"data: {_json.dumps({'type': type_, 'content': content})}\n\n"

    try:
        # Immediate handshake to prevent browser timeout
        yield sse("status", "Handshake established. RailSentry AI waking up...")
        
        inputs = {"anomaly_report": log_report, "tool_outputs": [], "iteration": 0}
        
        # Use astream_events (v2) for granular token and node tracking
        async for event in app.astream_events(inputs, version="v2"):
            kind = event["event"]
            
            # Token streaming for LLM generation
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    yield sse("token", content)
            
            # Node lifecycle tracking
            elif kind == "on_chain_start" and event["name"] == "LangGraph":
                yield sse("status", "Initializing RailSentry Pipeline...")
            
            elif kind == "on_chain_start" and event.get("metadata", {}).get("langgraph_node"):
                node_name = event["metadata"]["langgraph_node"]
                status = f"{node_name.title()} Agent active..."
                if node_name == "critic":
                    status = "Critic Agent auditing plan..."
                yield sse("node", status)

            # Tool use tracking
            elif kind == "on_tool_start":
                tool_name = event["name"]
                yield sse("tool", f"Executing tool: {tool_name}...")

        yield sse("done", "")
    except Exception as e:
        import traceback
        err_msg = str(e)
        print(f"CRITICAL ERROR in stream_kavach_agent: {err_msg}")
        print(traceback.format_exc())
        yield sse("token", f"❌ Error: {err_msg}")
        yield sse("done", "")

async def run_kavach_agent_legacy(log_report: str):
    """Backwards compatible non-streaming version."""
    inputs = {"anomaly_report": log_report, "iteration": 0}
    output = await app.ainvoke(inputs)
    return output["final_advice"]
