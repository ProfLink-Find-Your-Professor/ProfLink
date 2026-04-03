import urllib.request
import json
import difflib

# Data transcribed from the screenshot
data = [
    {"name": "Dr. V. Ramachandra Murty", "room": "BT - 5", "loc": "AB2", "mail": "murty.vvtla@manipal.edu"},
    {"name": "Dr. M. Ramananda Bhat", "room": "BT - 4", "loc": "AB2", "mail": "mr.bhat@manipal.edu"},
    {"name": "Dr. Bharath Raja Guru", "room": "BT - 3", "loc": "AB2", "mail": "bharath.guru@manipal.edu"},
    {"name": "Dr. S. Balaji", "room": "BT - 2", "loc": "AB2", "mail": "s.balaji@manipal.edu"},
    {"name": "Dr. Ritu Raval", "room": "BT - 14", "loc": "AB2", "mail": "ritu.raval@manipal.edu"},
    {"name": "Dr. V. Thivaharan", "room": "BT - 12", "loc": "AB2", "mail": "thivaharan.v@manipal.edu"},
    {"name": "Dr. Naresh Kumar Mani", "room": "BT - 8", "loc": "AB2", "mail": "naresh.mani@manipal.edu"},
    {"name": "Dr. Narasimhan S.", "room": "BT - 10", "loc": "AB2", "mail": "narasimhan.s@manipal.edu"},
    {"name": "Dr. Mukunthan K.S", "room": "AB 2 - 2F1", "loc": "AB2", "mail": "mukunthan.ks@manipal.edu"},
    {"name": "Dr. Kannan N.", "room": "BT - 1", "loc": "AB2", "mail": "kannan.ns@manipal.edu"},
    {"name": "Dr. Subbalaxmi S.", "room": "AB 2 - 1F2", "loc": "AB2", "mail": "subbalaxmi.s@manipal.edu"},
    {"name": "Dr. S. Md. A. Fayaz", "room": "BT - 7", "loc": "AB2", "mail": "fayaz.shaik@manipal.edu"},
    {"name": "Dr. Divyashree M S", "room": "BT - 6", "loc": "AB2", "mail": "divyashree.ms@manipal.edu"},
    {"name": "Dr. Salmataj S.A.", "room": "BT - 15", "loc": "AB2", "mail": "salma.taj@manipal.edu"},
    {"name": "Dr. Ravindranath B.S.", "room": "BT - 7", "loc": "AB2", "mail": "ravindranath.bs@manipal.edu"},
    {"name": "Dr. Chiranjit Ghosh", "room": "BT - 11", "loc": "AB2", "mail": "chiranjit.ghosh@manipal.edu"},
    {"name": "Dr. Vijendra Prabhu", "room": "BT - 9", "loc": "AB2", "mail": "vijendra.prabhu@manipal.edu"},
    {"name": "Dr. Praveen Kumar", "room": "BT - 9", "loc": "AB2", "mail": "kumar.praveen@manipal.edu"},
    {"name": "Dr. J. Rajesh", "room": "BT - 11", "loc": "AB2", "mail": "juturu.rajesh@manipal.edu"},
    {"name": "Dr. Archana M. Rao", "room": "BT - 13", "loc": "AB2", "mail": "archana.rao@manipal.edu"},
    {"name": "Dr. Vrunda Nagaraj Katagi", "room": "BT - 13", "loc": "AB2", "mail": "vrunda.katagi@manipal.edu"},
    {"name": "Dr. Dibyajyoti Haldar", "room": "11", "loc": "AB1", "mail": "dibyajyoti.haldar@manipal.edu"}
]

target_dept = "Biotechnology"
target_school = "School of Chemical and Biotechnology"

url = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors'
service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8'

headers_get = {
    'apikey': service_role_key,
    'Authorization': f'Bearer {service_role_key}',
    'Content-Type': 'application/json'
}

print('Fetching all profiles from Supabase...')
req = urllib.request.Request(url, headers=headers_get)
response = urllib.request.urlopen(req)
all_data = json.loads(response.read().decode('utf-8'))

# We want to match all db professors, since their department might be "Pending Update" or "Biomedical Engineering" or anything
db_names = [p['name'] for p in all_data]

to_update = []

for entry in data:
    pdf_name = entry['name']
    pdf_name_clean = pdf_name.replace("Dr. ", "").replace("Mr. ", "").replace("Ms. ", "").strip().lower()
    
    matched_db_name = None
    
    # Try exact match 
    for name in db_names:
        clean = name.replace("Dr. ", "").replace("Mr. ", "").replace("Ms. ", "").strip().lower()
        if clean == pdf_name_clean:
            matched_db_name = name
            break
            
    # Substring match if no exact
    if not matched_db_name:
        for name in db_names:
            clean = name.replace("Dr. ", "").replace("Mr. ", "").replace("Ms. ", "").strip().lower()
            # checking if both have sufficient length overlap
            if pdf_name_clean in clean or clean in pdf_name_clean:
                if len(clean) > 5 and len(pdf_name_clean) > 5:
                    matched_db_name = name
                    break

    # Fuzzy match
    if not matched_db_name:
        clean_db_names = [n.replace("Dr. ", "").replace("Mr. ", "").replace("Ms. ", "").strip().lower() for n in db_names]
        matches = difflib.get_close_matches(pdf_name_clean, clean_db_names, n=1, cutoff=0.7)
        if matches:
            matched_clean = matches[0]
            for n in db_names:
                if n.replace("Dr. ", "").replace("Mr. ", "").replace("Ms. ", "").strip().lower() == matched_clean:
                    matched_db_name = n
                    break
                    
    if matched_db_name:
        prof_record = next(p for p in all_data if p['name'] == matched_db_name)
        new_cabin = f"{entry['room']} {entry['loc']}".strip()
        new_mail = entry['mail']
        
        updated = False
        original_dept = prof_record.get('department', '')
        
        if prof_record.get('cabin') != new_cabin:
            prof_record['cabin'] = new_cabin
            updated = True
        
        if prof_record.get('mail') != new_mail:
            prof_record['mail'] = new_mail
            updated = True
            
        if prof_record.get('department') != target_dept:
            prof_record['department'] = target_dept
            updated = True
            
        if prof_record.get('school') != target_school:
            prof_record['school'] = target_school
            updated = True
            
        if updated:
            to_update.append(prof_record)
            print(f"To Update: {matched_db_name} | Dept: {original_dept}->{target_dept} | Cabin: -> {new_cabin} | Mail -> {new_mail}")
        else:
            print(f"Skipping (Already up to date): {matched_db_name}")
    else:
        print(f"NO MATCH FOUND FOR: {pdf_name}")

print(f"\nTotal to update: {len(to_update)}")

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
        print("Successfully updated the Biotechnology data to the live Supabase!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error: {e}")
