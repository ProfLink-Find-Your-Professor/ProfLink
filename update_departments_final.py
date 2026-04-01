import urllib.request
import json

url = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors'
service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8'

headers_get = {
    'apikey': service_role_key,
    'Authorization': f'Bearer {service_role_key}',
    'Content-Type': 'application/json'
}

print('Fetching all profiles from Supabase...')
req = urllib.request.Request(url, headers=headers_get)
try:
    response = urllib.request.urlopen(req)
    all_data = json.loads(response.read().decode('utf-8'))
except Exception as e:
    print('Failed to fetch:', e)
    exit(1)

to_update = []

for row in all_data:
    dept = row.get('department', '') or ''
    school = row.get('school', '') or ''
    name = row.get('name', '') or ''
    str_row = json.dumps(row).lower()
    
    needs_update = False
    new_dept = dept
    new_school = school
    
    # Biotech
    if 'biotech' in str_row:
        new_dept = 'Biotechnology'
        new_school = 'School of Civil and Chemical Engineering'
        needs_update = True
        
    # Aeronautical
    elif 'aeronaut' in str_row or 'automobile' in str_row or 'auto' in dept.lower():
        new_dept = 'Aeronautical Engineering'
        new_school = 'School of Mechanical Engineering'
        needs_update = True
        
    # Civil
    elif 'civil' in dept.lower() and dept != 'Pending Update':
        new_dept = 'Civil Engineering'
        new_school = 'School of Civil and Chemical Engineering'
        needs_update = True
        
    if needs_update and (dept != new_dept or school != new_school):
        # We only want to upload the fields that need replacing to merge properly, but Prefer=resolution=merge-duplicates requires full objects usually.
        # Actually we just upload the full modified object.
        row['department'] = new_dept
        row['school'] = new_school
        to_update.append(row)

print(f'Found {len(to_update)} profiles to update...')
if not to_update:
    print('No updates needed.')
    exit(0)

headers_post = {
    'apikey': service_role_key,
    'Authorization': f'Bearer {service_role_key}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
}

req_post = urllib.request.Request(url, data=json.dumps(to_update).encode('utf-8'), headers=headers_post, method='POST')

try:
    response = urllib.request.urlopen(req_post)
    print("Successfully updated the JSON data to the live Supabase!")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
