import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import MinMaxScaler

def load_data(data_path, file_name):
    # C-MAPSS data has no header and is space-delimited
    # Structure: UnitID, Cycle, OpSetting1, OpSetting2, OpSetting3, Sensor1...Sensor21
    col_names = ['unit_id', 'cycle', 'os1', 'os2', 'os3'] + [f's{i}' for i in range(1, 22)]
    df = pd.read_csv(os.path.join(data_path, file_name), sep=r'\s+', header=None, names=col_names)
    return df

def preprocess_for_railway(df):
    """
    Adapts CMaps data to Railway Asset Monitoring labels.
    - s2 -> Vibration (Segment-A42)
    - s3 -> Axle Temperature (Hot Box)
    - s4 -> Bearing Wear Score
    """
    # Normalize sensors
    scaler = MinMaxScaler()
    sensor_cols = [f's{i}' for i in range(1, 22)]
    df[sensor_cols] = scaler.fit_transform(df[sensor_cols])
    
    # Map to railway context
    railway_df = df[['unit_id', 'cycle']].copy()
    railway_df['vibration_score'] = df['s2']
    railway_df['axle_temp'] = df['s3']
    railway_df['bearing_wear'] = df['s4']
    
    # Calculate Severity (mock logic based on sensor thresholds)
    # High vibration and high temp indicate high severity
    railway_df['severity_score'] = (railway_df['vibration_score'] * 0.4 + 
                                    railway_df['axle_temp'] * 0.4 + 
                                    railway_df['bearing_wear'] * 0.2)
    
    return railway_df, scaler

if __name__ == "__main__":
    DATA_PATH = r"d:\full_stack_ml\railway\CMaps"
    TRAIN_FILE = "train_FD001.txt"
    
    print(f"Loading data from {TRAIN_FILE}...")
    df = load_data(DATA_PATH, TRAIN_FILE)
    
    print("Preprocessing for Railway context...")
    railway_df, scaler = preprocess_for_railway(df)
    
    # Save the processed data for training
    os.makedirs(r"d:\full_stack_ml\data\processed", exist_ok=True)
    railway_df.to_csv(r"d:\full_stack_ml\data\processed\train_railway.csv", index=False)
    print("Processed data saved to d:\\full_stack_ml\\data\\processed\\train_railway.csv")
