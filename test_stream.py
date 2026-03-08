import requests
import json

url = "http://localhost:8000/analyze_stream"
payload = {"message": "Anomaly Detected: Segment-5, Vibration Score: 0.36, Probable Cause: Bearing Wear, Severity: Medium"}

print(f"Testing streaming endpoint: {url}")
try:
    with requests.post(url, json=payload, stream=True, timeout=30) as r:
        if r.status_code != 200:
            print(f"Error: Status code {r.status_code}")
            print(r.text)
        else:
            print("Connected. Receiving stream...")
            for line in r.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    print(f"Event: {decoded_line}")
except Exception as e:
    print(f"Request failed: {e}")
