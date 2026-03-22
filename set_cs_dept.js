const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function setCS() {
    console.log("Reading CSE mapping list...");
    const rawData = JSON.parse(fs.readFileSync('cse_data.json', 'utf8'));
    let count = 0;
    
    // We update by their exact email
    for(const email of Object.keys(rawData)) {
        const { error } = await db.from('professors')
            .update({ department: 'Computer Science' })
            .eq('mail', email);
            
        if(error) {
            console.error(`Failed on ${email}:`, error.message);
        } else {
            count++;
        }
    }
    console.log(`Successfully updated department to "Computer Science" for ${count} professors!`);
}

setCS();
