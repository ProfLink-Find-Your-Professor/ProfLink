const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: allProfs } = await db.from('professors').select('*');
    let count = 0;
    
    for(const p of allProfs) {
        if(p.department.toLowerCase().includes('school') || p.department.toLowerCase().includes('schoo')) {
            const { error: updateErr } = await db.from('professors').update({
                school: p.department,
                department: "Pending Update" 
            }).eq('id', p.id);
            
            if(updateErr) {
                console.error("Supabase Error:", updateErr.message);
                console.log("Stopping script to avoid further failures.");
                break;
            }
            count++;
        }
    }
    console.log(`Moved ${count} schools successfully.`);
}
run();
