const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function fixMissing() {
    // Adithi Shasthry K -> "Humanities and Management AB2-First Floor- Faculty Cabin 3- FC 14"
    // Nagraj Kamath H -> "Humanities and Management AB2-First Floor- Faculty Cabin 05- FC 27"

    // Fix Adithi
    let { data: aditiData } = await db.from('professors').select('*').ilike('name', '%Adit%');
    let aditi = aditiData ? aditiData.find(p => p.name.includes('Shastry') || p.name.includes('Shasthry')) : null;
    
    if (aditi) {
        await db.from('professors').update({
            cabin: 'AB2-First Floor- Faculty Cabin 3- FC 14',
            department: 'Humanities and Management',
            school: 'Basic sciences , humanities and management'
        }).eq('id', aditi.id);
        console.log("Updated", aditi.name);
    } else {
        console.log("Adithi not found. Dump:", aditiData.map(d => d.name));
    }

    // Fix Nagraj
    let { data: nagarajData } = await db.from('professors').select('*').ilike('name', '%Nagaraj Kamath H%');
    if (nagarajData && nagarajData.length > 0) {
        await db.from('professors').update({
            cabin: 'AB2-First Floor- Faculty Cabin 05- FC 27',
            department: 'Humanities and Management',
            school: 'Basic sciences , humanities and management'
        }).eq('id', nagarajData[0].id);
        console.log("Updated", nagarajData[0].name);
    } else {
        console.log("Nagaraj Kamath not found.");
    }
}

fixMissing();
