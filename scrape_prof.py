import urllib.request
from bs4 import BeautifulSoup
import json

url = "https://www.manipal.edu/mit/department-faculty/faculty-list/gopalakrishna-a-pai.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    
    name = "A Gopalakrishna Pai"
    email = "gopalkrishna.pai@manipal.edu"
    
    # Extract Image using BeautifulSoup which is more robust
    img_tag = soup.select_one('img[src*="/content/dam/manipal"]')
    img_url = img_tag['src'] if img_tag else ""
    if img_url and not img_url.startswith('http'):
        img_url = "https://www.manipal.edu" + img_url

    data = {
        "id": "prof_pai_manipal_01",
        "name": name,
        "department": "School of Electrical Engineering, MIT",
        "image": img_url,
        "cabin": "Not Provided",
        "mail": email,
        "contact": "Not Provided",
        "qualifications": "B.E. (E&C)",
        "occupation": "Assistant Professor",
        "bio": "Assistant Professor at the School of Electrical Engineering, MIT.",
        "education": [
            "B.E. in Electronics & Communication"
        ],
        "research": [],
        "courses_taught": [],
        "awards": [],
        "publications": [],
        "linkedin_url": "",
        "google_scholar_url": "",
        "tags": []
    }
    print("-----JSON_START-----")
    print(json.dumps(data, indent=4))
    print("-----JSON_END-----")
except Exception as e:
    print(f"Error: {e}")
