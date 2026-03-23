const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function findRajendra() {
    const { data, error } = await db.from('professors')
        .select('*')
        .ilike('name', '%Rajendra%')
        
    if (error) {
        console.error(error);
        return;
    }
    
    // Attempting to match B.V. Rajendra
    const raj = data.find(p => p.name.includes("B") && p.name.includes("V"));
    if (raj) {
        const { error: updateErr } = await db.from('professors').update({
            cabin: 'AB2-Basement Floor- Physics Department- Cabin 06',
            department: 'Physics',
            school: 'Basic sciences , humanities and management'
        }).eq('id', raj.id);
        
        if (!updateErr) {
            console.log("[SUCCESS] Updated", raj.name);
        } else {
            console.log("Error updating:", updateErr);
        }
    } else {
        console.log("Could not find him. Found:", data.map(d => d.name));
    }
}

findRajendra();
