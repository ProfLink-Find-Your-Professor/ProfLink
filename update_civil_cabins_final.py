import urllib.request
import json
import PyPDF2
import difflib

# 1. First, parse the PDF
pdf_path = 'Civil Engineering/civil engineering department cabins.pdf'
reader = PyPDF2.PdfReader(pdf_path)
pdf_text = []
for page in reader.pages:
    pdf_text.append(page.extract_text())
full_text = "\n".join(pdf_text)

lines = full_text.split('\n')
extracted_mapping = []

designations = [
    "Professor/Dean", "Professor", "Associate Professor", 
    "Asst. Professor"
]

for line in lines:
    if "Civil Department Faculty" in line or "SN Name Designation" in line or line.startswith("Page"):
        continue
    
    if line and line[0].isdigit():
        import re
        line = re.sub(r'^\d+', '', line)
    
    found_desig = None
    for desig in designations:
        if desig in line:
            found_desig = desig
            break
            
    if not found_desig:
        continue
        
    parts = line.split(found_desig)
    name = parts[0].strip()
    cabin_location = parts[1].strip()
    
    # Remove things like (Sl. Grade) or (Sr. Scale) from the beginning of cabin_location
    import re
    cabin_location = re.sub(r'^\(Sl\. Grade\)\s*', '', cabin_location)
    cabin_location = re.sub(r'^\(Sr\. Scale\)\s*', '', cabin_location)
    
    # Clean cabin location: starts with "-" e.g. "-R&D KEF"
    if cabin_location.startswith('-'):
        cabin_location = cabin_location[1:].strip()
        
    extracted_mapping.append({'name': name, 'cabin': cabin_location})

# 2. Fetch from Supabase
url = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors'
service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8'

headers_get = {
    'apikey': service_role_key,
    'Authorization': f'Bearer {service_role_key}',
    'Content-Type': 'application/json'
}

req = urllib.request.Request(url, headers=headers_get)
response = urllib.request.urlopen(req)
all_data = json.loads(response.read().decode('utf-8'))

civil_profs = [row for row in all_data if row.get('department') == 'Civil Engineering']

# 3. Match and Prepare Update
to_update = []
db_names = [p['name'] for p in civil_profs]

for entry in extracted_mapping:
    pdf_name = entry['name']
    pdf_name_clean = pdf_name.replace("Dr. ", "").replace("Mr. ", "").replace("Ms. ", "").strip()
    
    # Exact match first
    matched_db_name = None
    for name in db_names:
        if name.lower().replace("dr. ", "").replace("mr. ", "").replace("ms. ", "").strip() == pdf_name_clean.lower():
            matched_db_name = name
            break
            
    # Fuzzy match if no exact match
    if not matched_db_name:
        matches = difflib.get_close_matches(pdf_name_clean, db_names, n=1, cutoff=0.6)
        if not matches:
             matches = difflib.get_close_matches(pdf_name_clean, [n.replace("Dr. ", "").replace("Mr. ", "").replace("Ms. ", "") for n in db_names], n=1, cutoff=0.5)
             if matches:
                 # find original
                 matched_clean = matches[0]
                 for n in db_names:
                     if n.replace("Dr. ", "").replace("Mr. ", "").replace("Ms. ", "") == matched_clean:
                         matched_db_name = n
                         break
        else:
             matched_db_name = matches[0]
    
    if matched_db_name:
        prof_record = next(p for p in civil_profs if p['name'] == matched_db_name)
        new_cabin = entry['cabin']
        
        # We always want to update because previous run put bad strings
        prof_record['cabin'] = new_cabin
        to_update.append(prof_record)
        print(f"Updating: {matched_db_name} -> New: {new_cabin} (Matched from: {pdf_name})")

# 4. Perform Update
headers_post = {
    'apikey': service_role_key,
    'Authorization': f'Bearer {service_role_key}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
}

print(f"\nTotal to update: {len(to_update)}")
if to_update:
    req_post = urllib.request.Request(url, data=json.dumps(to_update).encode('utf-8'), headers=headers_post, method='POST')
    try:
        urllib.request.urlopen(req_post)
        print("Successfully updated with cleaned Cabin data!")
    except Exception as e:
        print(f"Error: {e}")
