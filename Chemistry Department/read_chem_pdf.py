import sys
import PyPDF2

try:
    pdf_path = r'c:\Users\Rohit Reddy\Desktop\My_Python_Projects\ProfLink\Chemistry Department\Chemistry_Faculty_List_Final.pdf'
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
    with open('chem_text.txt', 'w', encoding='utf-8') as out:
        out.write(text)
    print("Success")
except Exception as e:
    print("Error:", e)
