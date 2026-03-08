import json
import os
from datetime import datetime

MEMORY_FILE = os.path.join(os.path.dirname(__file__), "../../data/memory.json")

def save_to_memory(segment: str, cause: str, resolution: str):
    """Saves a maintenance resolution to the local memory store."""
    os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)
    
    memory = []
    if os.path.exists(MEMORY_FILE):
        try:
            with open(MEMORY_FILE, 'r') as f:
                memory = json.load(f)
        except:
            memory = []
            
    memory.append({
        "timestamp": datetime.now().isoformat(),
        "segment": segment,
        "cause": cause,
        "resolution": resolution
    })
    
    # Keep only last 50 entries
    memory = memory[-50:]
    
    with open(MEMORY_FILE, 'w') as f:
        json.dump(memory, f, indent=2)

def get_past_context(segment: str):
    """Retrieves past resolutions for a specific segment."""
    if not os.path.exists(MEMORY_FILE):
        return ""
    
    with open(MEMORY_FILE, 'r') as f:
        memory = json.load(f)
        
    relevant = [m for m in memory if m["segment"] == segment]
    if not relevant:
        return ""
    
    context = "\n--- Historical Context for " + segment + " ---\n"
    for m in relevant[-3:]: # Get last 3 issues
        context += f"- {m['timestamp'][:10]}: Past {m['cause']} resolved with: {m['resolution'][:100]}...\n"
    return context
