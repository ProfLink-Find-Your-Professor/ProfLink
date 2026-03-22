import urllib.request
from bs4 import BeautifulSoup

url = "https://www.manipal.edu/mit/department-faculty/faculty-list/gopalakrishna-a-pai.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    imgs = soup.find_all('img')
    for img in imgs:
        src = img.get('src')
        if src:
            print(src)
except Exception as e:
    print(f"Error: {e}")
