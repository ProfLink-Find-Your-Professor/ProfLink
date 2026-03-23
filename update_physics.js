const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

const physicsFaculty = [
    { search: "Kalpataru%Panda", cabin: "AB2-Basement Floor- Physics Department- Cabin 01" },
    { search: "Dinesh%Negi", cabin: "AB2-Basement Floor- Physics Department- Cabin 02" },
    { search: "Mahesha", cabin: "AB2-Basement Floor- Physics Department- Cabin 03" },
    { search: "Pramoda%Kumara%Shetty", cabin: "AB2-Basement Floor- Physics Department- Cabin 04" },
    { search: "Ashwatha%Narayana%Prabhu", cabin: "AB2-Basement Floor- Physics Department- Cabin 05" },
    { search: "B.V.%Rajendra", cabin: "AB2-Basement Floor- Physics Department- Cabin 06" },
    { search: "Poornesh", cabin: "AB2-Basement Floor- Physics Department- Cabin 07" },
    { search: "Mamatha%D%Daivajna", cabin: "AB2-Basement Floor- Physics Department- Cabin 08" },
    { search: "Ismayil", cabin: "AB2-Basement Floor- Physics Department- Cabin 09" },
    { search: "Bhaghyesh", cabin: "AB2-Basement Floor- Physics Department- Cabin 10" },
    { search: "Gurumurthy", cabin: "AB2-Basement Floor- Physics Department- Cabin 11" },
    { search: "Raviprakash", cabin: "AB2-Basement Floor- Physics Department- Cabin 12" },
    { search: "Gowrish%Rao", cabin: "AB2-Basement Floor- Physics Department- Cabin 13" },
    { search: "Vikash%Mishra", cabin: "AB2-Basement Floor- Physics Department- Cabin 14" },
    { search: "Akhilesh%Ranjan", cabin: "AB2-Basement Floor- Physics Department- Cabin 15" },
    { search: "Dhananjaya%Kekuda", cabin: "AB2-Basement Floor- Physics Department- Cabin 16" }
];

async function updatePhysics() {
    let matched = 0;
    
    for (const f of physicsFaculty) {
        // Search by name
        let { data, error } = await db.from('professors')
            .select('id, name, department, school, cabin')
            .ilike('name', `%${f.search}%`);
            
        if (error) {
            console.error(`Error searching ${f.search}:`, error.message);
            continue;
        }

        // If no data, try removing % and replacing with space or just the first name
        if (!data || data.length === 0) {
            let alternativeSearch = f.search.split('%')[0];
            const result = await db.from('professors')
                .select('id, name, department, school, cabin')
                .ilike('name', `%${alternativeSearch}%`);
            data = result.data;
            if (result.error) console.error(`Retry error for ${alternativeSearch}:`, result.error.message);
        }
        
        if (data && data.length > 0) {
            // Find the best match, sometimes alternative search returns multiple.
            // But assume data[0] is correct for now or filter by department if they are basic sciences.
            
            const prof = data[0];
            
            const { error: updateErr } = await db.from('professors').update({
                cabin: f.cabin,
                department: 'Physics',
                school: 'Basic sciences , humanities and management'
            }).eq('id', prof.id);
            
            if (updateErr) {
                console.error(`Failed to update ${prof.name}:`, updateErr.message);
            } else {
                console.log(`[SUCCESS] ${prof.name} -> ${f.cabin}`);
                matched++;
            }
        } else {
            console.log(`[NOT FOUND] Unable to find ${f.search} in DB.`);
        }
    }
    
    console.log(`\nFinished executing. Successfully matched and updated ${matched}/${physicsFaculty.length} professors!`);
}

updatePhysics();
