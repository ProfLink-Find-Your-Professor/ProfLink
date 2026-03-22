const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function updateChemical() {
    console.log("Fetching Chemical Engineering professors...");
    const { data: profs, error } = await db.from('professors')
        .select('id, name, department, school')
        .ilike('department', '%Chemical%Engineering%');

    if (error) {
        console.error("Error fetching:", error);
        return;
    }

    console.log(`Found ${profs.length} professors in Chemical Engineering.`);
    
    let updatedCount = 0;
    for (let p of profs) {
        // Strip out "Manipal Institute of Technology" and any trailing hyphens/spaces
        let newDept = p.department.replace(/manipal institute of technology/i, '').replace(/-\s*mit/i, '').replace(/-\s*$/, '').trim();
        let updates = {};
        let needsUpdate = false;
        
        if (p.school !== "School of Basic Sciences") {
            updates.school = "School of Basic Sciences";
            needsUpdate = true;
        }
        if (newDept !== p.department) {
            updates.department = newDept;
            needsUpdate = true;
            // Also explicitly standardize to "Department of Chemical Engineering" if they prefer, but let's just do regex cleanup
        }
        
        // Force standardize exactly to "Department of Chemical Engineering" to be safe and clean
        if (p.department.toLowerCase().includes('department of chemical engineering')) {
            updates.department = "Department of Chemical Engineering";
            needsUpdate = true;
        }

        if (needsUpdate) {
            const { error: updErr } = await db.from('professors')
                .update(updates)
                .eq('id', p.id);
                
            if (updErr) {
                console.error(`Failed to update ${p.name}:`, updErr);
            } else {
                console.log(`[UPDATED] ${p.name} | Dept: ${updates.department || p.department} | School: ${updates.school || p.school}`);
                updatedCount++;
            }
        }
    }
    console.log(`DONE! Updated ${updatedCount} records.`);
}
updateChemical();
