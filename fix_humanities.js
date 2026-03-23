const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function fixHumanities() {
    // 1. Revert known incorrect matches
    const reverts = [
        "Dr. E. Sreehari",
        "Dr. G Divya Deepak",
        "Dr. Bhagya R Navada",
        "Nithesh Naik"
    ];

    for (const r of reverts) {
        const {data} = await db.from('professors').select('id, name').ilike('name', r);
        if (data && data.length > 0) {
            await db.from('professors').update({
                department: 'Pending Update',
                school: 'School of Basic Sciences', // Assumption based on screenshot
                cabin: 'Not Provided Online'
            }).eq('id', data[0].id);
            console.log("Reverted", data[0].name);
        }
    }

    // 2. Find and update the missed correct faculties
    const missing = [
        { search: "Hari M G", cabin: "AB2-First Floor- Faculty Cabin 1- FC 01" },
        { search: "Deepa B S", cabin: "AB2-First Floor- Faculty Cabin 3- FC 06" },
        { search: "Bhagya R S", cabin: "AB2-First Floor- Faculty Cabin 05- FC 29" },
        { search: "Nithesh Kumar KS", cabin: "AB2-First Floor- Faculty Cabin 05- FC 31" }
    ];

    for (const m of missing) {
        // Build a flexible like query: e.g. "%Hari%M%G%"
        let likeString = "%" + m.search.split(' ').join('%') + "%";
        
        let { data } = await db.from('professors').select('id, name').ilike('name', likeString);
        
        if (!data || data.length === 0) {
            // Try another approach: 
            likeString = "%" + m.search + "%";
            const res = await db.from('professors').select('id, name').ilike('name', likeString);
            data = res.data;
        }

        if (data && data.length > 0) {
            const prof = data[0];
            await db.from('professors').update({
                department: 'Humanities and Management',
                school: 'Basic sciences , humanities and management',
                cabin: m.cabin
            }).eq('id', prof.id);
            console.log("Updated", prof.name, "->", m.cabin);
            
            // Check if there was a wrong one we didn't revert, we might need to find it and revert it
            // if we now found the right one.
        } else {
            console.log("Still could not find", m.search);
        }
    }
}

fixHumanities();
