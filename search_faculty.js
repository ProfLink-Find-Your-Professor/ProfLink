const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function search() {
    let { data: allProfs, error } = await db.from('professors').select('id, name, department, school, cabin');
    
    const queries = ['vasanth', 'shama', 'dayananda', 'pramod', 'shankarnarayana', 'ramasamy', 'enaganti', 'praveen'];
    
    for (let q of queries) {
        console.log(`\n--- Matches for ${q} ---`);
        let matches = allProfs.filter(p => (p.name || '').toLowerCase().includes(q));
        matches.forEach(m => console.log(`- [${m.id}] ${m.name} | Dept: ${m.department} | School: ${m.school} | Cabin: ${m.cabin}`));
    }
}
search();
