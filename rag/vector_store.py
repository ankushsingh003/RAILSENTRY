from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from langchain_core.documents import Document
import os

def create_vector_db():
    # Load manual
    manual_path = r"d:\full_stack_ml\data\manuals\ir_manual.txt"
    with open(manual_path, "r") as f:
        text = f.read()
    
    # Split text into chunks
    text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_text(text)
    
    # Convert to Documents
    docs = [Document(page_content=t) for t in chunks]
    
    # Create Embeddings
    print("Initializing embeddings (Sentence-Transformers)...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    # Create FAISS index
    print("Creating FAISS index...")
    vector_db = FAISS.from_documents(docs, embeddings)
    
    # Save vector DB
    save_path = r"d:\full_stack_ml\rag\vector_db"
    vector_db.save_local(save_path)
    print(f"Vector DB saved to {save_path}")

if __name__ == "__main__":
    create_vector_db()
