from langchain_core.tools import tool
import random

@tool
def check_maintenance_inventory(component_name: str):
    """Checks the current stock of railway maintenance components in the nearest depot."""
    # Simulated inventory database
    inventory = {
        "Sleeper": random.randint(50, 200),
        "Rail Section": random.randint(10, 40),
        "Fastener": random.randint(500, 2000),
        "Ballast": random.randint(100, 500),
        "Fishplate": random.randint(20, 100)
    }
    
    # Simple fuzzy match or default
    stock = inventory.get(component_name.title(), random.randint(5, 50))
    return f"Inventory Check for '{component_name}': {stock} units available at Central Depot (Zone-4)."

@tool
def calculate_stress_index(vibration_score: float, temperature: float):
    """Calculates a physics-based track stress index to help in maintenance planning."""
    # Simplified physics formula: (Vibration * 0.7) + ((Temp - 40) * 0.3)
    stress = (vibration_score * 0.7) + ((max(temperature, 40) - 40) * 0.05)
    severity = "NOMINAL"
    if stress > 0.8: severity = "CRITICAL"
    elif stress > 0.5: severity = "ELEVATED"
    
    return {
        "stress_index": round(stress, 3),
        "recommended_action": "Immediate inspection" if severity == "CRITICAL" else "Schedule maintenance",
        "severity": severity
    }
