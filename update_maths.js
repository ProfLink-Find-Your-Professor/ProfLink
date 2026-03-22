const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

const faculties = [
    { search: "Kuncham%Syam", code: "S5" },
    { search: "Nagaraj%N", code: "S2" },
    { search: "Kedukodi", code: "S4" },
    { search: "Srivatsa%Kumar", code: "E10" },
    { search: "Manjunatha%Gudekote", code: "E5" },
    { search: "Harikrishnan", code: "S6" },
    { search: "Indira%K", code: "N11" },
    { search: "Girish%M", code: "E9" },
    { search: "Baiju%T", code: "S1" },
    { search: "Vadiraja", code: "E6" },
    { search: "Sumathi%K", code: "N20" },
    { search: "Rekha%G", code: "E7" },
    { search: "Prathima%J", code: "E8" },
    { search: "Devadas%Nayak", code: "N15" },
    { search: "Sujatha%H", code: "N16" },
    { search: "Lavanya", code: "E3" },
    { search: "Sabitha", code: "N10" },
    { search: "Shobha%M", code: "N9" },
    { search: "Sampath%Kumar", code: "N17" },
    { search: "Arathi%Bhat", code: "N5" },
    { search: "Sayinath", code: "N13" },
    { search: "Ashwini%Bhat", code: "N14" },
    { search: "Kavitha%Koppula", code: "N7" },
    { search: "Soumya%K", code: "N8" },
    { search: "Anitha%Raghunath", code: "E4" },
    { search: "Vidya%H", code: "S8" },
    { search: "Divya%Shenoy", code: "N4" },
    { search: "Smitha%G", code: "N6" },
    { search: "Choudhary", code: "N12" }, 
    { search: "Swati%S", code: "N3" },
    { search: "Anu%Radha", code: "N22" },
    { search: "Gowtham", code: "N2" },
    { search: "Vinay%Madhusudanan", code: "S7" },
    { search: "Amrithalakshmi", code: "N22" },
    { search: "Shahistha", code: "E2" },
    { search: "Sandhya%S", code: "E2" },
    { search: "Balachandra", code: "N19" },
    { search: "Harinakshi", code: "E4" },
    { search: "Rakshith%B", code: "N18" },
    { search: "Akansha", code: "S8" },
    { search: "Argha%Ghosh", code: "S7" },
    { search: "Aishwarya%S", code: "S4" },
    { search: "Priyabrata", code: "S9" },
    { search: "Sandeep%E", code: "S9" }
];

async function updateMaths() {
    let matched = 0;
    
    // Process sequentially to be safe with rate limits
    for (const f of faculties) {
        if (!f.code) continue; 
        
        const prefix = f.code.charAt(0).toUpperCase();
        const num = f.code.substring(1);
        let wing = "";
        if (prefix === 'E') wing = "East Wing";
        if (prefix === 'N') wing = "North Wing";
        if (prefix === 'S') wing = "South Wing";
        
        const cabinStr = `AB2-2nd Floor-Maths Department-${wing}-Cabin ${num}`;
        
        // Search for the professor strictly in the Basic Sciences dept to avoid hitting identical names
        const { data, error } = await db.from('professors')
            .select('id, name, courses_taught, cabin')
            .ilike('name', `%${f.search}%`)
            .ilike('department', '%Basic%');
            
        if (error) {
            console.error(`Error searching ${f.search}:`, error.message);
            continue;
        }
        
        if (data && data.length > 0) {
            // Take the first match
            const prof = data[0];
            let courses = prof.courses_taught || [];
            
            // Ensure unique 'Mathematics' addition
            if (!courses.includes("Mathematics")) {
                courses.push("Mathematics");
            }
            
            // Apply Update
            const { error: updateErr } = await db.from('professors').update({
                cabin: cabinStr,
                courses_taught: courses
            }).eq('id', prof.id);
            
            if (updateErr) {
                console.error(`Failed to update ${prof.name}:`, updateErr.message);
            } else {
                console.log(`[SUCCESS] ${prof.name} -> ${cabinStr}`);
                matched++;
            }
        } else {
            console.log(`[NOT FOUND] Unable to find ${f.search} in DB.`);
        }
    }
    
    console.log(`\nFinished executing. Successfully matched and updated ${matched}/${faculties.length} professors!`);
}

updateMaths();
