const url = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors?select=*';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTU5ODIsImV4cCI6MjA4OTYzMTk4Mn0.YuT-qnKXnFKpnkixhPn4Nfa1VltR9cd9BKto8w3PLdY';

async function test() {
    const res = await fetch(url, {
        headers: { apikey: anonKey, Authorization: 'Bearer ' + anonKey }
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Returned:", Array.isArray(data) ? "Array with " + data.length + " items" : data);
    if(Array.isArray(data) && data.length > 0) {
        console.log("Sample:", data[0].name);
    }
}
test();
