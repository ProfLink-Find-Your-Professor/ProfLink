import urllib.request
import json

url = "https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors"
service_role_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8"

# read data.json
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

headers = {
    'apikey': service_role_key,
    'Authorization': f'Bearer {service_role_key}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')

try:
    response = urllib.request.urlopen(req)
    print("Successfully uploaded the JSON data to the live Supabase!")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
