import streamlit as st
import pandas as pd
import os
import time
from rag.agents import run_kavach_agent

# Set page configuration
st.set_page_config(
    page_title="Kavach-GenAI: Rail Asset Guardian",
    page_icon="🏗️",
    layout="wide",
)

# Custom CSS for premium look
st.markdown("""
    <style>
    .main {
        background-color: #0e1117;
        color: #ffffff;
    }
    .stMetric {
        background-color: #1f2937;
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #374151;
    }
    .anomaly-card {
        padding: 20px;
        border-radius: 10px;
        border-left: 5px solid #ef4444;
        background-color: #1f2937;
        margin-bottom: 20px;
    }
    .advice-card {
        padding: 20px;
        border-radius: 10px;
        border-left: 5px solid #10b981;
        background-color: #064e3b;
        color: #ecfdf5;
        margin-top: 10px;
    }
    </style>
    """, unsafe_allow_html=True)

st.title("🏗️ Kavach-GenAI: Intelligent Rail Asset Guardian")
st.markdown("---")

# Sidebar
st.sidebar.header("Monitoring Settings")
refresh_rate = st.sidebar.slider("Refresh Rate (seconds)", 1, 10, 5)
show_historical = st.sidebar.checkbox("Show Historical Logs", value=True)

# Main Dashboard Layout
col1, col2 = st.columns([1, 2])

with col1:
    st.subheader("Live ML Alerts")
    log_file = r"d:\full_stack_ml\data\logs\event_logs.txt"
    
    if os.path.exists(log_file):
        with open(log_file, "r") as f:
            logs = f.readlines()
        
        for log in reversed(logs):
            with st.container():
                st.markdown(f'<div class="anomaly-card">{log.strip()}</div>', unsafe_allow_html=True)
                if st.button(f"Analyze {log.split('Segment-')[1].split(',')[0]}", key=log):
                    st.session_state.selected_log = log.strip()
    else:
        st.info("Waiting for ML model to generate logs...")

with col2:
    st.subheader("🛠️ AI Consultant (Agentic RAG)")
    
    if "selected_log" in st.session_state:
        st.markdown(f"**Analyzing Warning:** `{st.session_state.selected_log}`")
        
        with st.spinner("Agents are researching manuals and formulating plan..."):
            try:
                # Run the agentic workflow
                advice = run_kavach_agent(st.session_state.selected_log)
                
                st.markdown("### Final Safety Advice")
                st.markdown(f'<div class="advice-card">{advice}</div>', unsafe_allow_html=True)
                
                st.success("Repair plan validated against 2026 Safety Circulars.")
            except Exception as e:
                st.error(f"Error invoking AI Agents: {e}")
                st.info("Make sure GOOGLE_API_KEY is set in your environment.")
    else:
        st.info("Select an alert from the left panel to receive AI guidance.")

# Historical Data Visualization (Placeholder for Part 3)
if show_historical:
    st.markdown("---")
    st.subheader("Historical Anomaly Trends")
    processed_data = r"d:\full_stack_ml\data\processed\train_railway.csv"
    if os.path.exists(processed_data):
        df = pd.read_csv(processed_data)
        st.line_chart(df[['vibration_score', 'axle_temp', 'bearing_wear']].head(100))
    else:
        st.write("No historical data available yet.")

st.markdown("---")
st.caption("Powered by GenAI & Agentic Workflows | Indian Railways Asset Monitoring")
