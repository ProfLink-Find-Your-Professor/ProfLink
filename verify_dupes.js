const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

const faculties = [
    { search: "Kuncham%Syam" }, { search: "Nagaraj%N" }, { search: "Kedukodi" }, { search: "Srivatsa%Kumar" },
    { search: "Manjunatha%Gudekote" }, { search: "Harikrishnan" }, { search: "Indira%K" }, { search: "Girish%M" },
    { search: "Baiju%T" }, { search: "Vadiraja" }, { search: "Sumathi%K" }, { search: "Rekha%G" },
    { search: "Prathima%J" }, { search: "Devadas%Nayak" }, { search: "Sujatha%H" }, { search: "Lavanya" },
    { search: "Sabitha" }, { search: "Shobha%M" }, { search: "Sampath%Kumar" }, { search: "Arathi%Bhat" },
    { search: "Sayinath" }, { search: "Ashwini%Bhat" }, { search: "Kavitha%Koppula" }, { search: "Soumya%K" },
    { search: "Anitha%Raghunath" }, { search: "Vidya%H" }, { search: "Divya%Shenoy" }, { search: "Smitha%G" },
    { search: "Choudhary" }, { search: "Swati%S" }, { search: "Anu%Radha" }, { search: "Gowtham" },
    { search: "Vinay%Madhusudanan" }, { search: "Amrithalakshmi" }, { search: "Shahistha" }, { search: "Sandhya%S" },
    { search: "Balachandra" }, { search: "Harinakshi" }, { search: "Rakshith%B" }, { search: "Akansha" },
    { search: "Argha%Ghosh" }, { search: "Aishwarya%S" }, { search: "Priyabrata" }, { search: "Sandeep%E" }
];

async function verify() {
    let riskyMatches = [];
    for(const f of faculties) {
        const { data } = await db.from('professors').select('name, department').ilike('name', `%${f.search}%`);
        if(data && data.length > 1) {
            riskyMatches.push({ search: f.search, matches: data });
        }
    }
    
    if (riskyMatches.length > 0) {
        console.log("Found risky searches that matched multiple professors:");
        console.dir(riskyMatches, {depth: null});
    } else {
        console.log("Safe! Every search mapped to exactly ONE unique professor or zero!");
    }
}
verify();
