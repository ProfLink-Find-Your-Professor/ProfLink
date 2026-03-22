const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function updateICT() {
    console.log("Fetching matching professors...");
    const { data: profs, error } = await db.from('professors')
        .select('id, name, department, school')
        .ilike('department', '%Information%Communication%Technology%');

    if (error) {
        console.error("Error fetching:", error);
        return;
    }

    console.log(`Found ${profs.length} professors in ICT.`);
    
    let updatedCount = 0;
    for (let p of profs) {
        if (p.school !== "School of Computer Engineering") {
            const { error: updErr } = await db.from('professors')
                .update({ school: "School of Computer Engineering" })
                .eq('id', p.id);
                
            if (updErr) {
                console.error(`Failed to update ${p.name}:`, updErr);
            } else {
                console.log(`[UPDATED] ${p.name} (${p.department}) -> School of Computer Engineering`);
                updatedCount++;
            }
        }
    }
    console.log(`DONE! Updated ${updatedCount} records.`);
}
updateICT();
