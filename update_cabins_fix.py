import urllib.request
import json
import re

url = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors'
service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8'
headers_get = {'apikey': service_role_key, 'Authorization': f'Bearer {service_role_key}', 'Content-Type': 'application/json'}
req = urllib.request.Request(url, headers=headers_get)
all_data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

to_update = []
changes_report = []

def process_civil_cabin(c):
    # Ignore specific ones
    if "R&D KEF" in c or "Not Provided" in c or "Study Leave" in c or "Arch Block" in c:
        return c
        
    c = c.strip()
    c = c.replace(' (Corridor)', ' Corridor')
    c = c.replace('(Basement)', 'Basement')
    
    # 06 FC-1 (Basement) => AB2-Basement-Faculty room 1-Chamber 06
    m1 = re.match(r'^(\d+)\s*FC-(\d+)\s*(Basement)$', c, re.IGNORECASE)
    if m1:
        return f"AB2-Basement-Faculty room {m1.group(2)}-Chamber {m1.group(1)}"
        
    # 28 FC-2 Basement => AB2-Basement-Faculty room 2-Chamber 28
    m2 = re.match(r'^(\d+)\s*FC-(\d+).*$', c, re.IGNORECASE)
    if m2:
        return f"AB2-Basement-Faculty room {m2.group(2)}-Chamber {m2.group(1)}"
        
    # FC-3 => AB2-Faculty room 3
    m3 = re.match(r'^FC-(\d+)$', c, re.IGNORECASE)
    if m3:
        return f"AB2-Faculty room {m3.group(1)}"
        
    # 22 Basement (Corridor) => AB2-Basement-Corridor-Chamber 22
    m4 = re.match(r'^(\d+)\s*Basement\s*Corridor$', c, re.IGNORECASE)
    if m4:
        return f"AB2-Basement-Corridor-Chamber {m4.group(1)}"
        
    # 22 Basement => AB2-Basement-Chamber 22
    m5 = re.match(r'^(\d+)\s*Basement$', c, re.IGNORECASE)
    if m5:
        return f"AB2-Basement-Chamber {m5.group(1)}"
        
    # 35 Ground Floor => AB2-Ground Floor-Chamber 35
    m6 = re.match(r'^(\d+)\s*Ground Floor$', c, re.IGNORECASE)
    if m6:
        return f"AB2-Ground Floor-Chamber {m6.group(1)}"
        
    return c

for p in all_data:
    c = p.get('cabin', '')
    if not c: continue
    
    orig_c = c
    new_c = orig_c
    
    # 1. Strip 'Unknown Floor' and 'Unknown Faculty room'
    # "AB2-Unknown Floor-BT-Chamber 1" -> "AB2-BT-Chamber 1"
    # "AB5-Third Floor-Unknown Faculty room-Chamber 27" -> "AB5-Third Floor-Chamber 27"
    
    if 'Unknown' in new_c:
        parts = new_c.split('-')
        parts = [part for part in parts if 'Unknown' not in part]
        new_c = "-".join(parts)
        
    # 2. Civil Department Logic
    if p.get('department') == 'Civil Engineering':
        # Need to re-process if it hasn't been properly formatted
        # First, un-do anything like 'AB2-Unknown...' if it was there, by passing the original? 
        # But wait, original for Civil was like '23 FC-2 (Basement)'
        parsed_civil = process_civil_cabin(orig_c)
        if parsed_civil != orig_c:
            new_c = parsed_civil
        elif process_civil_cabin(new_c) != new_c:
            new_c = process_civil_cabin(new_c)
            
    if new_c != orig_c:
        p['cabin'] = new_c
        to_update.append(p)
        changes_report.append(f"- **{p['name']}**: `{orig_c}` => `{new_c}`")

print(f"Total entries to update: {len(to_update)}")

if to_update:
    headers_post = {
        'apikey': service_role_key,
        'Authorization': f'Bearer {service_role_key}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
    
    req_post = urllib.request.Request(url, data=json.dumps(to_update).encode('utf-8'), headers=headers_post, method='POST')
    try:
        response = urllib.request.urlopen(req_post)
        print("Successfully updated Supabase with formatted cabins!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error updating Supabase: {e}")
        
    with open('fixed_cabins.md', 'w', encoding='utf-8') as f:
        f.write("# Floor and Civil Cabin Fixes\n\n")
        f.write("\n".join(changes_report))
        print("Generated fixed_cabins.md report.")
else:
    print("No changes found to update.")

