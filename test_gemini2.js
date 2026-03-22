const API_KEY = 'AIzaSyC1pzWjEOTamdu-gEuJiApEkXu3OfYVwpI';
async function testModel(modelName) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
    console.log("Testing:", modelName);
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }]
        })
    });
    if (!res.ok) {
        let err = await res.text();
        console.log("FAILED:", modelName, res.status, err);
    } else {
        let data = await res.json();
        console.log("SUCCESS:", modelName, data.candidates[0].content.parts[0].text.substring(0, 30));
    }
}

async function run() {
    await testModel('gemini-1.5-flash');
    await testModel('gemini-1.5-pro');
    await testModel('gemini-pro');
    await testModel('gemini-1.0-pro');
}
run();
