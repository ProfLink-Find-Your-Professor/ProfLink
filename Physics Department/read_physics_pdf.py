import sys
try:
    import PyPDF2
    with open(r'c:\Users\Rohit Reddy\Desktop\My_Python_Projects\ProfLink\Physics Department\Physics_Faculty_Formatted-2.pdf', 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        with open('physics_text.txt', 'w', encoding='utf-8') as out:
            out.write(text)
        print("Success")
except Exception as e:
    print("Error:", e)
