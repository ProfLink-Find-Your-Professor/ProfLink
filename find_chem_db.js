const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function dumpChem() {
    const { data } = await db.from('professors').select('name, mail, department, cabin');
    
    // Filter by keywords found in OCR to find chemical engineering folks
    const keywords = ['harish', 'bandaru', 'srinivas', 'ramesh', 'priya', 'girish', 'muddu', 'harshini', 'gautham', 'ranjeet', 'vairavel', 'nethaji', 'anoop', 'laxman', 'sandeep', 'jitendra', 'shettigar', 'srikanth'];
    
    let potentials = data.filter(d => {
        if (d.department && d.department.toLowerCase().includes('chemical')) return true;
        let n = d.name.toLowerCase();
        for (let k of keywords) {
            if (n.includes(k)) {
                // To avoid massive dumps like all 'priya's, 'ramesh's, we can just print them grouped
                return true;
            }
        }
        return false;
    });
    
    // Write just the ones who have 'chemical' to start with
    const confirmedChem = potentials.filter(d => d.department && (d.department.toLowerCase().includes('chemical') || d.department.toLowerCase().includes('chem eng')));
    console.log(`Confirmed Chemical Dept (${confirmedChem.length}):`);
    confirmedChem.forEach(c => console.log(`  ${c.name} | ${c.mail} | cabin: ${c.cabin}`));
    
    if (confirmedChem.length > 0) {
        // We found them!
    } else {
        // Dump the rest
    }
}

dumpChem();
