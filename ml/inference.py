import torch
import pandas as pd
import numpy as np
import os
from ml_model import AnomalyLSTM, RailwayDataset

def generate_event_logs():
    # Hyperparameters
    sequence_length = 50
    input_size = 3
    hidden_size = 64
    num_layers = 2
    
    # Files
    test_data_path = r"d:\full_stack_ml\railway\CMaps\test_FD001.txt"
    model_path = r"d:\full_stack_ml\ml\models\kavach_lstm.pth"
    log_output_path = r"d:\full_stack_ml\data\logs"
    os.makedirs(log_output_path, exist_ok=True)
    
    # Load Model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = AnomalyLSTM(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    
    # Load and Preprocess Test Data (Same logic as process_data.py but for test set)
    col_names = ['unit_id', 'cycle', 'os1', 'os2', 'os3'] + [f's{i}' for i in range(1, 22)]
    test_df = pd.read_csv(test_data_path, sep=r'\s+', header=None, names=col_names)
    
    # Simple normalization and mapping for inference
    from sklearn.preprocessing import MinMaxScaler
    scaler = MinMaxScaler()
    sensor_cols = [f's{i}' for i in range(1, 22)]
    test_df[sensor_cols] = scaler.fit_transform(test_df[sensor_cols])
    
    # Focus on a few units for log generation
    event_logs = []
    units_to_test = test_df['unit_id'].unique()[:5] # Test first 5 units
    
    print(f"Generating Event Logs for units: {units_to_test}")
    
    with torch.no_grad():
        for unit_id in units_to_test:
            unit_df = test_df[test_df['unit_id'] == unit_id]
            if len(unit_df) >= sequence_length:
                # Take the latest sequence
                seq = unit_df.iloc[-sequence_length:][['s2', 's3', 's4']].values
                seq_tensor = torch.FloatTensor(seq).unsqueeze(0).to(device)
                
                # Predict severity
                prediction = model(seq_tensor).item()
                
                # Determine cause based on dominant sensor
                vibration = seq[-1, 0]
                temp = seq[-1, 1]
                wear = seq[-1, 2]
                
                cause = "Bearing Wear"
                if temp > vibration and temp > wear:
                    cause = "Hot Box (Overheating)"
                elif vibration > temp and vibration > wear:
                    cause = "High Vibration / Track Defect"
                
                severity = "Low"
                if prediction > 0.7:
                    severity = "High"
                elif prediction > 0.4:
                    severity = "Medium"
                
                # Generate Log
                log_entry = f"[Anomaly Detected: Segment-{unit_id}, Vibration Score: {vibration:.2f}, Probable Cause: {cause}, Severity: {severity}]"
                event_logs.append(log_entry)
                print(log_entry)
    
    # Save logs
    with open(os.path.join(log_output_path, "event_logs.txt"), "w") as f:
        for log in event_logs:
            f.write(log + "\n")
            
    print(f"Event logs saved to {os.path.join(log_output_path, 'event_logs.txt')}")

if __name__ == "__main__":
    generate_event_logs()
