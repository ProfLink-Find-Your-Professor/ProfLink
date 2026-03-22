const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTU5ODIsImV4cCI6MjA4OTYzMTk4Mn0.YuT-qnKXnFKpnkixhPn4Nfa1VltR9cd9BKto8w3PLdY';
const db = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await db.from('professors').select('id');
    if (error) console.error("Error", error);
    else console.log("Total professors in Supabase:", data.length);
}
test();
