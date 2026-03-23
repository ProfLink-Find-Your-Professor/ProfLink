const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function findChem() {
    const queries = ['%Santhosh%', '%Anil%Kumar%', '%Fas%', '%Nithin%'];
    
    for (const q of queries) {
        let { data } = await db.from('professors').select('id, name, department').ilike('name', q);
        console.log(`Results for ${q}:`);
        if (data) {
             data.forEach(d => console.log(`  - ${d.name} (${d.department})`));
        }
    }
}

findChem();
