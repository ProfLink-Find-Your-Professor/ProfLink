const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

const facultyList = {
    // Professor and Head
    "Kuncham Syam Prasad": "S5",
    // Professors
    "Nagaraj N. Katagi": "S2",
    "Kedukodi Babushri Srinivas": "S4",
    "Srivatsa Kumar B. R.": "E10",
    "Manjunatha Gudekote": "E5",
    "Harikrishnan P.K.": "S6",
    // Additional Professors
    "Indira K.P.": "N11",
    "Girish M. Sajjanshettar": "E9",
    "Baiju T.": "S1",
    // Associate Professors
    "Vadiraja Bhatta G.R": "E6",
    "Sumathi K.": "N20",
    "Rekha G. Pai": "E7",
    "Prathima J.": "E8",
    "Devadas Nayak C.": "N15",
    "Sujatha H.S.": "N16",
    "B. Lavanya": "E3",
    "Sabitha D'Souza": "N10",
    "Shobha M.E.": "N9",
    "Sampath Kumar V.S": "N17",
    "K. Arathi Bhat": "N5",
    "Sayinath Udupa N.V": "N13",
    // Assistant Professor Selection Grade
    "Ashwini Bhat": "N14",
    "Kavitha Koppula": "N7",
    "Soumya K.V.": "N8",
    "D. Anu Radha": "N22",
    "Gowtham H. J.": "N2",
    // Assistant Professor Senior Scale
    "Anitha Raghunath": "E4",
    "Vidya H C.": "S8",
    "Divya Shenoy P.": "N4",
    "Smitha G. Bhat": "N6",
    "Santosh Kumar Choudhary": "N12",
    "Swati S. Nayak": "N3",
    // Assistant Professors
    "Vinay Madhusudanan": "S7",
    "Amrithalakshmi": "N22",
    "Shahistha": "E2",
    "Sandhya S. Pai": "E2",
    "Balachandra S. Hadimani": "N19",
    "Harinakshi Karkera": "E4",
    "Rakshith B. R.": "N18",
    "Akansha": "S8",
    "Argha Ghosh": "S7",
    "Aishwarya S.": "S4",
    "Priyabrata Mandal": "S9",
    "Sandeep E. M.": "S9",
    "Sunita Sharma": "Not Provided",
    "Aditya Subramaniam": "Not Provided",
    "Athira T M": "Not Provided"
};

function formatCabin(code) {
    if(!code || code === 'Not Provided') return 'Not Provided Online';

    const direction = code[0].toUpperCase();
    const num = code.substring(1);

    let wing = "";
    if (direction === 'N') wing = "North Wing";
    else if (direction === 'S') wing = "South Wing";
    else if (direction === 'E') wing = "East Wing";
    else return code;

    return `AB2-2nd Floor-Maths Department-${wing}-Chamber ${num}`;
}

async function updateMaths() {
    let count = 0;
    
    // We will fetch ALL professors from basic sciences safely
    const { data: allProfs, error } = await db.from('professors').select('id, name').ilike('school', '%Basic%');
    
    if (error) {
        console.log("Error fetching:", error);
        return;
    }
    
    // Fuzzy matching over 'name' locally since exact names may differ slightly in DB (e.g., initial positions)
    for (const [imgName, code] of Object.entries(facultyList)) {
        let bestMatch = null;
        
        // Exact parts fuzzy logic
        const queryParts = imgName.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ');
        
        for (const prof of allProfs) {
            const dbName = prof.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            let score = 0;
            for(const part of queryParts) {
                if(part.length > 2 && dbName.includes(part)) score++;
                if(dbName.startsWith(part)) score += 0.5;
            }
            if(score > queryParts.length * 0.5) {
                bestMatch = prof;
                break;
            }
        }
        
        if (bestMatch) {
            const cabinString = formatCabin(code);
            const { error: updErr } = await db.from('professors').update({
                department: 'Mathematics',
                school: 'School of Basic Science, Humanities and Management',
                cabin: cabinString
            }).eq('id', bestMatch.id);
            
            if (!updErr) {
                count++;
                console.log(`Matched: ${imgName} -> DB: ${bestMatch.name} | ${cabinString}`);
            }
        } else {
            console.log(`COULD NOT FIND MATCH FOR: ${imgName}`);
            // Fallback: try raw DB query just in case our filter missed it
            const { data: fb } = await db.from('professors').select('id, name, school').ilike('name', `%${queryParts[0]}%`);
            if (fb && fb.length === 1) {
                 const cabinString = formatCabin(code);
                 await db.from('professors').update({
                     department: 'Mathematics',
                     school: 'School of Basic Science, Humanities and Management',
                     cabin: cabinString
                 }).eq('id', fb[0].id);
                 count++;
                 console.log(`FALLBACK Matched: ${imgName} -> DB: ${fb[0].name} | ${cabinString}`);
            }
        }
    }
    
    console.log(`Update execution finished! Total Mathematics faculties uniquely updated: ${count}`);
}

updateMaths();
