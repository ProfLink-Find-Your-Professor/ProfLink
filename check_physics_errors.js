const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

const physicsNames = [
    "Kalpataru Panda", "Dinesh Negi", "Mahesha M.G.", "Pramoda Kumara Shetty",
    "Ashwatha Narayana Prabhu", "B.V. Rajendra", "Poornesh P", "Mamatha D Daivajna",
    "Ismayil", "Bhaghyesh", "Gurumurthy S.C.", "Raviprakash Y", "Gowrish Rao K",
    "Vikash Mishra", "Akhilesh Ranjan", "Dhananjaya Kekuda"
].map(n => n.toLowerCase().replace(/[^a-z0-9]/g, ''));

async function checkPhysics() {
    const { data: currentPhysics } = await db.from('professors')
        .select('id, name')
        .eq('department', 'Physics');
        
    console.log(`Found ${currentPhysics ? currentPhysics.length : 0} currently marked as Physics.`);
    
    const wronglyUpdated = [];
    
    for (const prof of currentPhysics || []) {
        let dbNameVal = prof.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        let isValid = false;
        for (const vName of physicsNames) {
            if (dbNameVal.includes(vName) || vName.includes(dbNameVal)) {
                isValid = true;
                break;
            }
        }
        
        // Manual checks if needed
        if (prof.name.includes("Mahesha M G") || prof.name.includes("Gowrish K Rao") || prof.name.includes("Gurumurthy S C") || prof.name.includes("Dr. Rajendra B V")) isValid = true;

        if (!isValid) {
            wronglyUpdated.push(prof);
        }
    }
    
    console.log("Wrongly updated count:", wronglyUpdated.length);
    for (const w of wronglyUpdated) {
        console.log("- ", w.name);
    }
}

checkPhysics();
