import urllib.request
import json

url = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors?department=eq.Pending%20Update'
service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8'

headers = {
    'apikey': service_role_key,
    'Authorization': 'Bearer ' + service_role_key,
    'Content-Type': 'application/json'
}

req = urllib.request.Request(url, headers=headers)
try:
    response = urllib.request.urlopen(req)
    data = json.loads(response.read().decode('utf-8'))
    print('PENDING UPDATE PROFS:', len(data))
    for row in data:
        print(row.get('name', ''), row.get('occupation', ''), row.get('school', ''))
except Exception as e:
    print('Error:', e)
