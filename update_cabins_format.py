import urllib.request
import json
import re

url = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors'
service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8'
headers_get = {'apikey': service_role_key, 'Authorization': f'Bearer {service_role_key}', 'Content-Type': 'application/json'}
req = urllib.request.Request(url, headers=headers_get)
data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

def convert_cabin(c):
    c = c.strip()
    
    # 1. Matches: Block - Floor - Faculty Rooms X - Chamber Y
    m1 = re.match(r'^([^-\n]+)\s*-\s*([^-\n]+)\s*-\s*Faculty\s*Rooms?\s*(.*?)\s*-\s*Chamber\s*([^-\n]+)$', c, re.IGNORECASE)
    if m1:
        block = m1.group(1).strip()
        floor = m1.group(2).strip()
        room_num = m1.group(3).strip()
        chamber_num = m1.group(4).strip()
        room_str = f'Faculty room {room_num}'.strip() if room_num else 'Faculty room'
        # ensure "Floor" is capitalized properly
        return f'{block}-{floor.title()}-{room_str}-Chamber {chamber_num}'

    # 2. Matches: Block--Floor-ICAS-Chamber Y
    m2 = re.match(r'^(AB\d+)\s*--\s*([^-\n]+)\s*-\s*([^-\n]+)\s*-\s*Chamber\s*([^-\n]+)$', c, re.IGNORECASE)
    if m2:
        block = m2.group(1).strip()
        floor = m2.group(2).strip()
        fac_room = m2.group(3).strip()
        chamber_num = m2.group(4).strip()
        floor = floor.replace(' Floor', '').replace(' floor', '') + ' Floor' # normalize '2 Floor'
        return f'{block}-{floor.title()}-{fac_room}-Chamber {chamber_num}'

    # 3. Matches: Block-Floor-Chamber Y  (missing faculty room)
    m_missing_room = re.match(r'^([^-\n]+)\s*-\s*([^-\n]+)\s*-\s*Chamber\s*([^-\n]+)$', c, re.IGNORECASE)
    if m_missing_room:
        block = m_missing_room.group(1).strip()
        floor = m_missing_room.group(2).strip()
        chamber_num = m_missing_room.group(3).strip()
        if 'Faculty Rooms' not in floor and 'Faculty room' not in floor:
            return f'{block}-{floor.title()}-Unknown Faculty room-Chamber {chamber_num}'

    # 4. Matches: BT - 5 AB2
    m3 = re.match(r'^(BT)\s*-\s*(\d+)\s+(AB\d+)$', c, re.IGNORECASE)
    if m3:
        dept = m3.group(1).strip()
        chamber_num = m3.group(2).strip()
        block = m3.group(3).strip()
        return f'{block}-Unknown Floor-{dept}-Chamber {chamber_num}'
        
    return c

to_update = []
changes_report = []

for p in data:
    c = p.get('cabin', '')
    if not c: continue
    
    new_c = convert_cabin(c)
    if new_c != c:
        p['cabin'] = new_c
        to_update.append(p)
        changes_report.append(f"- **{p['name']}**: `{c}` &rarr; `{new_c}`")

print(f"Total entries to update: {len(to_update)}")

if to_update:
    headers_post = {
        'apikey': service_role_key,
        'Authorization': f'Bearer {service_role_key}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
    
    # We can batch update to supabase via POST
    req_post = urllib.request.Request(url, data=json.dumps(to_update).encode('utf-8'), headers=headers_post, method='POST')
    try:
        response = urllib.request.urlopen(req_post)
        print("Successfully updated Supabase with formatted cabins!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error updating Supabase: {e}")
        
    with open('changed_cabins.md', 'w', encoding='utf-8') as f:
        f.write("# Cabin Format Changes\n\n")
        f.write("The following faculty cabin details were standardized to the `Block-Floor-faculty room-chamber` format:\n\n")
        f.write("\n".join(changes_report))
        print("Generated changed_cabins.md report.")
else:
    print("No changes found to update.")
