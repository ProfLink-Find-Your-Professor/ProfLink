const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function runUpdates() {
    // 1. Chemical Engineering
    console.log("Fetching Chemical Engineering...");
    const { data: chemEngg } = await db.from('professors')
        .select('id, name, department, school')
        .ilike('department', '%Chemical%Engineering%');

    let chemEnggUpdated = 0;
    for (let p of chemEngg || []) {
        if (p.school !== "School of Civil & Chemical Engineering") {
            const { error } = await db.from('professors')
                .update({ school: "School of Civil & Chemical Engineering" })
                .eq('id', p.id);
            if (!error) chemEnggUpdated++;
            console.log(`[UPDATED] ${p.name} -> School of Civil & Chemical Engineering`);
        }
    }
    console.log(`Updated ${chemEnggUpdated} Chemical Engineering faculties.`);

    // 2. Chemistry
    console.log("\nFetching Chemistry...");
    const { data: chemistry } = await db.from('professors')
        .select('id, name, department, school')
        .ilike('department', '%Chemistry%');

    let chemistryUpdated = 0;
    for (let p of chemistry || []) {
        if (p.school !== "School of Basic Sciences") {
            const { error } = await db.from('professors')
                .update({ school: "School of Basic Sciences" })
                .eq('id', p.id);
            if (!error) chemistryUpdated++;
            console.log(`[UPDATED] ${p.name} -> School of Basic Sciences`);
        }
    }
    console.log(`Updated ${chemistryUpdated} Chemistry faculties.`);
}

runUpdates();
