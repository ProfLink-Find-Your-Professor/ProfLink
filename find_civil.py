import urllib.request
import json

url = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors'
service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8'

headers = {
    'apikey': service_role_key,
    'Authorization': 'Bearer ' + service_role_key,
    'Content-Type': 'application/json'
}

req = urllib.request.Request(url, headers=headers)
response = urllib.request.urlopen(req)
data = json.loads(response.read().decode('utf-8'))

pending_civil = []
for r in data:
    dept = r.get('department', '') or ''
    school = r.get('school', '') or ''
    if dept == 'Pending Update' and 'civil' in school.lower():
        pending_civil.append(r)

print('Found Pending Update with Civil in school:', len(pending_civil))
for r in pending_civil[:10]:
    print(r['name'], r['school'])
