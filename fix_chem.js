const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

const missing = [
    { search: "Yashoda", cabin: "AB2-Ground Floor-CHM-11" },
    { search: "Santhosh Laxman", cabin: "AB2-Ground Floor-CHM-05" }, // Santhosh Laxman Gaonkar
    { search: "N V Anil Kumar", cabin: "AB2-Ground Floor-CHM-04" },
    { search: "Faslulla", cabin: "AB2-Ground Floor-CHM-01" },
    { search: "Nithin Kumar", cabin: "AB2-Ground Floor-CHM-15" }, 
    { search: "Sudhakar Y", cabin: "AB2-Ground Floor-CHM-10" },
    { search: "B S Manjunatha", cabin: "AB2-Ground Floor-CHM-08" },
    { search: "Partha Pratim", cabin: "AB2-Ground Floor-CHM-19" }, // PDF said "Pratham" might be a typo for "Pratim"
];

async function fixChem() {
    let matched = 0;
    for (const m of missing) {
        let likeStr = "%" + m.search.split(' ').join('%') + "%";
        let { data } = await db.from('professors').select('id, name, department').ilike('name', likeStr);
        
        if (!data || data.length === 0 && m.search === "Partha Pratim") {
             const res = await db.from('professors').select('id, name, department').ilike('name', '%Partha%Das%');
             data = res.data;
        }

        if (data && data.length > 0) {
            let prof = data[0];
            // If multiple, try to find one in chemistry or default to first
            if (data.length > 1) {
                const chemProf = data.find(d => d.department && d.department.toLowerCase().includes('chem'));
                if (chemProf) prof = chemProf;
                else {
                    // Try to avoid "Pending Update" if possible or pick exactly
                    console.log(`Multiple found for ${m.search}:`, data.map(d=>d.name).join(', '));
                    continue; 
                }
            }
            
            await db.from('professors').update({
                department: 'Chemistry',
                school: 'School of Basic Sciences, Humanities and Management',
                cabin: m.cabin
            }).eq('id', prof.id);
            console.log(`[SUCCESS] Updated ${prof.name} -> ${m.cabin}`);
            matched++;
        } else {
            console.log(`[NOT FOUND] for ${m.search}`);
        }
    }
    console.log(`Fixed ${matched}/${missing.length}`);
}

fixChem();
