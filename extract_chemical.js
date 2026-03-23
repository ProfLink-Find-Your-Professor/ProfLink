const fs = require('fs');

const API_KEY = 'AIzaSyC1pzWjEOTamdu-gEuJiApEkXu3OfYVwpI';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

async function extractImage() {
    try {
        const imagePath = 'Chemical Engineering/WhatsApp Image 2026-03-23 at 5.54.08 PM.jpeg';
        const imageBytes = fs.readFileSync(imagePath).toString("base64");

        const payload = {
            contents: [{
                parts: [
                    { text: "Extract the table of faculty members from this image. Return a valid JSON array of objects. Each object must have exactly these keys: 'name', 'email', 'room'. Do not include markdown code block syntax like ```json, just return the raw JSON array string." },
                    { 
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: imageBytes
                        }
                    }
                ]
            }]
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`API Error: ${res.status} - ${err}`);
        }

        const data = await res.json();
        let extractedText = data.candidates[0].content.parts[0].text;
        
        // Clean up markdown if model still insists on including it
        extractedText = extractedText.replace(/```json\n/i, '').replace(/```\n?/i, '').trim();
        
        fs.writeFileSync('Chemical Engineering/chemical_faculty.json', extractedText);
        console.log("Successfully extracted and wrote to chemical_faculty.json");
        
    } catch (error) {
        console.error("Extraction Failed:", error);
    }
}

extractImage();
