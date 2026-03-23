const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function processChem() {
    const text = fs.readFileSync('Chemistry Department/chem_text.txt', 'utf-8');
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let matched = 0;
    
    for (const line of lines) {
        if (line.includes('Faculty List') || line.startsWith('Page') || line.startsWith('SN Name')) continue;
        
        // Expected format: 1Dr. MP Yashoda Professor CHM-11
        // Splitting by ' Professor ', ' Additional Professor ', ' Associate Professor ', ' Assistant Professor '
        let match = line.match(/(.+?)\s+(?:Additional |Associate |Assistant |)Professor(?: - Senior Scale| - Selection Grade| - Research|)\s+(.+)/);
        
        if (!match) continue;
        
        let [full, rawName, room] = match;
        
        // clean name: remove leading digits, "Dr.", "Mr."
        let name = rawName.replace(/^\d+/, '').replace(/^Dr\.\s*/, '').replace(/^Mr\.\s*/, '').replace(/^Ms\.\s*/, '').trim();
        
        let cabinStr = `AB2-Ground Floor-${room}`;
        if (room.includes('AB4')) cabinStr = `AB4`; // Special case just in case, but let's stick to user request "AB2-Ground Floor-Cabin no"
        // The user explicitly said: format of cabin should be like : AB2-Ground Floor-Cabin no
        // So for AB4 maybe it should be "AB2-Ground Floor-AB4"
        // Let's just use what they asked:
        cabinStr = `AB2-Ground Floor-${room}`;
        
        // Search by parsing name parts
        const nameParts = name.split(' ').filter(p => p.length > 1); // remove initials
        const longestPart = nameParts.reduce((a, b) => a.length > b.length ? a : b, '');
        
        // First try to search by exact longest part
        let { data, error } = await db.from('professors').select('id, name, department').ilike('name', `%${longestPart}%`);
        
        if (error) {
            console.error('Error:', error.message);
            continue;
        }
        
        let profToUpdate = null;
        if (data && data.length > 0) {
            const potentials = data.filter(p => {
                let allMatch = true;
                for (const part of nameParts) {
                    if (!p.name.toLowerCase().includes(part.toLowerCase())) {
                        allMatch = false;
                        break;
                    }
                }
                return allMatch;
            });
            
            if (potentials.length === 1) {
                profToUpdate = potentials[0];
            } else if (potentials.length > 1) {
                // If multiple, maybe filter by those already in chemistry or basic sciences
                const best = potentials.find(p => p.department && p.department.toLowerCase().includes('chemistry'));
                if (best) profToUpdate = best;
            }
        }
        
        if (profToUpdate) {
            const { error: updateErr } = await db.from('professors').update({
                cabin: cabinStr,
                department: 'Chemistry',
                school: 'School of Basic Sciences, Humanities and Management'
            }).eq('id', profToUpdate.id);
            
            if (updateErr) {
                console.error(`Failed ${profToUpdate.name}:`, updateErr.message);
            } else {
                console.log(`[SUCCESS] ${profToUpdate.name} -> ${cabinStr}`);
                matched++;
            }
        } else {
            console.log(`[NOT FOUND] Name: ${name} (Longest part: ${longestPart})`);
        }
    }
    
    console.log(`\nFinished executing. Successfully matched and updated ${matched} professors!`);
}

processChem();
