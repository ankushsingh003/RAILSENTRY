import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from ml_model import AnomalyLSTM, RailwayDataset
import os

def train_model():
    # Hyperparameters
    batch_size = 64
    learning_rate = 0.001
    num_epochs = 10
    sequence_length = 50
    input_size = 3
    hidden_size = 64
    num_layers = 2
    
    # Files
    train_data_path = r"d:\full_stack_ml\data\processed\train_railway.csv"
    model_save_path = r"d:\full_stack_ml\ml\models"
    os.makedirs(model_save_path, exist_ok=True)
    
    # Dataset and Dataloader
    dataset = RailwayDataset(train_data_path, sequence_length=sequence_length)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    # Model, Loss, Optimizer
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = AnomalyLSTM(input_size=input_size, hidden_size=hidden_size, num_layers=num_layers).to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    # Training Loop
    print(f"Starting training on {device}...")
    for epoch in range(num_epochs):
        model.train()
        epoch_loss = 0
        for i, (sequences, targets) in enumerate(dataloader):
            sequences, targets = sequences.to(device), targets.to(device)
            
            # Forward pass
            outputs = model(sequences)
            loss = criterion(outputs.squeeze(), targets)
            
            # Backward and optimize
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            
        print(f'Epoch [{epoch+1}/{num_epochs}], Avg Loss: {epoch_loss/len(dataloader):.4f}')
    
    # Save the model
    torch.save(model.state_dict(), os.path.join(model_save_path, "kavach_lstm.pth"))
    print(f"Model saved to {os.path.join(model_save_path, 'kavach_lstm.pth')}")

if __name__ == "__main__":
    train_model()
