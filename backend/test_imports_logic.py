import sys
import os
ROOT = r"d:\full_stack_ml"
sys.path.insert(0, ROOT)
try:
    from rag.agents import run_kavach_agent
    print("SUCCESS: Imported run_kavach_agent")
    res = run_kavach_agent("test")
    print(f"RESULT: {res}")
except Exception as e:
    import traceback
    traceback.print_exc()
