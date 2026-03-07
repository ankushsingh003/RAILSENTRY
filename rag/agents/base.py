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

# --- Shared Components ---
def get_llm():
    return ChatGoogleGenerativeAI(model="gemini-1.5-pro")

def get_vector_db():
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return FAISS.load_local(r"d:\full_stack_ml\rag\vector_db", embeddings, allow_dangerous_deserialization=True)
