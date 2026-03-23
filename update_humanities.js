const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function updateHumanities() {
    const text = fs.readFileSync('Humanities/humanities_text.txt', 'utf-8');
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Line indices based on manual inspection of humanities_text.txt
    // Faculty Name starts on line 1 (0-indexed) with Dr. Sudhamshu...
    // Line 0 is "Faculty Name School Name"
    const facultyLines = lines.slice(1, 41);
    
    // Line 41 is "Department Cabin Details"
    const cabinLines = lines.slice(42, 82);
    
    if (facultyLines.length !== 40 || cabinLines.length !== 40) {
        console.error(`Parsing error: Found ${facultyLines.length} faculty and ${cabinLines.length} cabins. Expected 40 each.`);
        return;
    }
    
    let matched = 0;
    
    for (let i = 0; i < 40; i++) {
        const rawFaculty = facultyLines[i];
        const rawCabin = cabinLines[i];
        
        // Clean faculty name strings
        // Example: "Dr. Sudhamshu Bhushan Raju School of Basic Sciences Humanities and Management"
        let name = rawFaculty.replace(' School of Basic Sciences Humanities and Management', '').trim();
        name = name.replace(/^Dr\.\s*/, '').replace(/^Mr\.\s*/, '').replace(/^Ms\.\s*/, '').replace(/^Lt\.\s*Cdr\s*/, '');
        name = name.replace('Geethalakshmi P M (Retd.)', 'Geethalakshmi'); // Handling specific case
        
        // Clean cabin
        // Example: "Humanities and Management AB2-First Floor- Faculty Cabin 1- FC 01"
        let cabin = rawCabin.replace('Humanities and Management ', '').trim();
        
        // Search by individual parts of the name to be robust, but ensure all parts exist if possible, 
        // or just use ilike for the longest word in their name to find them, then verify.
        const nameParts = name.split(' ').filter(n => n.length > 2); // Ignore single letter initials for search
        const longestPart = nameParts.reduce((a, b) => a.length > b.length ? a : b, nameParts[0] || name);
        
        const { data, error } = await db.from('professors')
            .select('*')
            .ilike('name', `%${longestPart}%`);
            
        if (error) {
            console.error(`Error searching for ${name}:`, error.message);
            continue;
        }
        
        let profToUpdate = null;
        
        if (data && data.length === 1) {
            profToUpdate = data[0];
        } else if (data && data.length > 1) {
            // Need to disambiguate by checking if other parts of the name also match
            for (const p of data) {
                let allMatch = true;
                for (const part of nameParts) {
                    if (!p.name.toLowerCase().includes(part.toLowerCase())) {
                        allMatch = false;
                        break;
                    }
                }
                // Also check if they are already in humanities or if department is missing/wrong.
                // By right, we should rely on all word parts matching.
                if (allMatch) {
                    profToUpdate = p;
                    break;
                }
            }
        }
        
        if (profToUpdate) {
            const { error: updateErr } = await db.from('professors').update({
                cabin: cabin,
                department: 'Humanities and Management',
                school: 'Basic sciences , humanities and management'
            }).eq('id', profToUpdate.id);
            
            if (updateErr) {
                console.error(`Failed to update ${profToUpdate.name} (${name}):`, updateErr.message);
            } else {
                console.log(`[SUCCESS] ${profToUpdate.name} -> ${cabin}`);
                matched++;
            }
        } else {
            console.log(`[NOT FOUND OR AMBIGUOUS] Could not safely match: ${name} (Longest part: ${longestPart}). Found ${data ? data.length : 0} potentials.`);
            if (data && data.length > 0) {
                console.log(`  Options: ${data.map(d => d.name).join(', ')}`);
            }
        }
    }
    
    console.log(`\nFinished executing. Successfully matched and updated ${matched}/40 professors!`);
}

updateHumanities();
