from typing import TypedDict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# --- State Definition ---
class AgentState(TypedDict):
    anomaly_report: str
    parsed_anomaly: dict
    research_results: str
    maintenance_plan: str
    validation_status: str
    final_advice: str

_llm = None
_vector_db = None

# --- Shared Components ---
def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(model="models/gemini-1.5-pro")
    return _llm

def get_vector_db():
    global _vector_db
    if _vector_db is None:
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        _vector_db = FAISS.load_local(r"d:\full_stack_ml\rag\vector_db", embeddings, allow_dangerous_deserialization=True)
    return _vector_db
