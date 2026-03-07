import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import numpy as np
import os

class RailwayDataset(Dataset):
    def __init__(self, csv_file, sequence_length=50):
        self.df = pd.read_csv(csv_file)
        self.sequence_length = sequence_length
        self.features = ['vibration_score', 'axle_temp', 'bearing_wear']
        self.target = 'severity_score'
        
        # Prepare sequences
        self.data_sequences = []
        self.targets = []
        
        for unit_id in self.df['unit_id'].unique():
            unit_df = self.df[self.df['unit_id'] == unit_id]
            if len(unit_df) >= sequence_length:
                for i in range(len(unit_df) - sequence_length):
                    seq = unit_df.iloc[i:i+sequence_length][self.features].values
                    target = unit_df.iloc[i+sequence_length][self.target]
                    self.data_sequences.append(seq)
                    self.targets.append(target)
                    
        self.data_sequences = torch.FloatTensor(np.array(self.data_sequences))
        self.targets = torch.FloatTensor(np.array(self.targets))

    def __len__(self):
        return len(self.targets)

    def __getitem__(self, idx):
        return self.data_sequences[idx], self.targets[idx]

class AnomalyLSTM(nn.Module):
    def __init__(self, input_size=3, hidden_size=64, num_layers=2, output_size=1):
        super(AnomalyLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

if __name__ == "__main__":
    # Test initialization
    model = AnomalyLSTM()
    print("Model initialized successfully.")
    print(model)
    
    # Check if processed data exists
    PROCESSED_DATA = r"d:\full_stack_ml\data\processed\train_railway.csv"
    if os.path.exists(PROCESSED_DATA):
        dataset = RailwayDataset(PROCESSED_DATA)
        print(f"Dataset created with {len(dataset)} sequences.")
    else:
        print("Processed data not found. Please run ml/process_data.py first.")
