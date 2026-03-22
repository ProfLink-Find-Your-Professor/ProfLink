const API_KEY = 'AIzaSyC1pzWjEOTamdu-gEuJiApEkXu3OfYVwpI';
async function run() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
run();
