import sys
import os
ROOT = r"d:\full_stack_ml"
sys.path.insert(0, ROOT)
print(f"Path: {sys.path[:2]}")
try:
    import rag
    print(f"RAG file: {rag.__file__}")
    from rag import agents
    print(f"Agents file: {agents.__file__}")
    from rag.agents import base
    print(f"Base file: {base.__file__}")
    print("ALL SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
