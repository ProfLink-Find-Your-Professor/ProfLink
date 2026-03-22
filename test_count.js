const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors?select=id';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';

async function checkCount() {
    const res = await fetch(supabaseUrl, {
        headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Range-Unit': 'items',
            'Prefer': 'count=exact'
        }
    });
    console.log("Total Count Headers:", res.headers.get('content-range'));
    const data = await res.json();
    console.log("Fetched Length:", data.length);
}
checkCount();
