const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function updateChemicalList() {
    const searchTerms = [
        "harish.kumar@", "krishna.bandaru@", "bandau@", "bandaru@", "srinivas.kini@", "ramesh.v@",
        "shan.priya@", "shanmuga.priya@", "cr.girish@", "muddum@", "muddu.m@",
        "harshini.dasari@", "gautham.jeppu@", "ranjeet.mishra@", "vairavel.p@",
        "nethaji.s@", "anoopkishore", "anoop.kishore", "laxman.kumar@",
        "sandeep.parma", "jitendra.carpenter@", "Shettigarsuma", "suma.shettigar@", "srikanth.divi@"
    ];

    let query = searchTerms.map(term => `mail.ilike.%${term}%`).join(',');

    const { data: profs, error } = await db.from('professors').select('*').or(query);

    if (error) {
        console.error("Error fetching:", error);
        return;
    }

    console.log(`Found ${profs.length} professors matching emails in the list.`);

    let updatedCount = 0;
    for (const p of profs) {
        const updates = {
            department: "Chemical Engineering",
            school: "School of Civil and Chemical Engineering"
        };
        
        const { error: updErr } = await db.from('professors')
            .update(updates)
            .eq('id', p.id);
            
        if (updErr) {
            console.error(`Failed to update ${p.name}:`, updErr);
        } else {
            console.log(`[UPDATED] ${p.name} (${p.mail}) -> Dept: ${updates.department} | School: ${updates.school}`);
            updatedCount++;
        }
    }
    console.log(`DONE! Updated ${updatedCount} records.`);
}

updateChemicalList();
