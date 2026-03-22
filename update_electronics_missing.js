const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

const missingFaculty = [
    { name: "Dr. Praveen Kumar", room: "Faculty Rooms 3", chamber: "Chamber 48" },
    { name: "Dr. Kumara Shama", room: "Faculty Rooms 4", chamber: "Chamber 56" },
    { name: "Dr. Dayananda Nayak", room: "Faculty Rooms 4", chamber: "Chamber 53" },
    { name: "Dr. Pramod Kumar", room: "Faculty Rooms 3", chamber: "Chamber 21" },
    { name: "Dr. Shankarnarayana Bhat M.", room: "Faculty Rooms 4", chamber: "Chamber 52" },
    { name: "Mr. Vasanth Kumar P", room: "Faculty Rooms 1", chamber: "Chamber 04" },
    { name: "Mr. Prashant M Prabhu", room: "Faculty Rooms 3", chamber: "Chamber 37" },
    { name: "Dr. Ramasamy S", room: "Faculty Rooms 3", chamber: "Chamber 44" }
];

// Relaxed normalization: just split into parts and find them
function normalizeForSearch(name) {
    return name.replace(/^(Dr\.|Mr\.|Ms\.|Dr|Mr|Ms)\s+/i, '').trim().toLowerCase().split(/\s+/);
}

async function start() {
    let { data: allProfs, error } = await db.from('professors').select('*');
    if(error) {
        console.error("Failed to fetch professors: ", error);
        return;
    }

    let updatedCount = 0;
    
    for (let f of missingFaculty) {
        let parts = normalizeForSearch(f.name);
        
        // Find professors that have at least one part matching (just broadly filter)
        let candidates = allProfs.filter(p => {
            let pName = (p.name || '').toLowerCase();
            // A strong match means ALL name parts are inside their database name
            // For example "Pramod Kumar" -> "pramod" and "kumar", checking if db name has both
            return parts.every(part => pName.includes(part));
        });
        
        let validCandidates = candidates.filter(c => {
            let recordStr = JSON.stringify(c).toLowerCase();
            return recordStr.includes('electron') || recordStr.includes('electr');
        });

        if (validCandidates.length === 1) {
            let actualMatch = validCandidates[0];
            let formattedCabin = `AB5 - Ground Floor - ${f.room} - ${f.chamber}`;
            
            let updates = {
                cabin: formattedCabin,
                school: "Electrical Engineering",
                department: "Electronics"
            };
            
            const { error: updErr } = await db.from('professors').update(updates).eq('id', actualMatch.id);
            if(!updErr) {
                console.log(`[UPDATED] ${f.name} -> Matched: ${actualMatch.name}`);
                updatedCount++;
            } else {
                console.log(`[ERROR] Failed to update ${f.name}: ${updErr.message}`);
            }
        } else if (validCandidates.length > 1) {
            console.log(`[WARNING] Multiple valid electronics matches for ${f.name}: ` + validCandidates.map(c=>c.name).join(', '));
        } else {
            console.log(`[MISSING] Still could not confidently match ${f.name} in electronics.`);
        }
    }
    console.log(`\nDONE! Updated ${updatedCount} out of ${missingFaculty.length}`);
}

start();
