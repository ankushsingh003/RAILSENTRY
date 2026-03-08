from typing import TypedDict
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv() # Load from .env if it exists
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from .tools import check_maintenance_inventory, calculate_stress_index

# --- State Definition ---
class AgentState(TypedDict):
    anomaly_report: str
    parsed_anomaly: dict
    research_results: str
    maintenance_plan: str
    validation_status: str
    final_advice: str
    tool_outputs: list # Track tool interactions
    critique: str      # Self-correction feedback
    iteration: int     # Debate loop counter
    past_history: str  # Historical context from memory

_llm = None
_vector_db = None

# --- Shared Components ---
def get_llm():
    global _llm
    if _llm is None:
        # Aggressively Reload .env to catch changes (strip anyway)
        from dotenv import load_dotenv
        load_dotenv(override=True)
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if google_api_key:
            google_api_key = google_api_key.strip(' "').strip("'")
            os.environ["GOOGLE_API_KEY"] = google_api_key
            print(f"--- API Key DEBUG: len={len(google_api_key)} prefix={google_api_key[:10]} suffix={google_api_key[-5:]} ---")
            print(f"--- Key Matches Env: {google_api_key == os.getenv('GOOGLE_API_KEY')} ---")
        
        print("--- Initializing Gemini 1.5 Pro ---")
        # Ensure model name is correct (no 'models/' prefix)
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro")
        # Bind tools to LLM
        tools = [check_maintenance_inventory, calculate_stress_index]
        _llm = llm.bind_tools(tools)
    return _llm

def get_vector_db():
    global _vector_db
    if _vector_db is None:
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        _vector_db = FAISS.load_local(r"d:\full_stack_ml\rag\vector_db", embeddings, allow_dangerous_deserialization=True)
    return _vector_db
