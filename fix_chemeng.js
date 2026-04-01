const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function fixChemEng() {
    // 1. Revert Dr. Dasharathraj K Shetty (wrongly matched via "raja.s")
    let { data: wrongData } = await db.from('professors').select('id, name, department').ilike('name', '%Dasharathraj%');
    if (wrongData && wrongData.length > 0 && wrongData[0].department === 'Chemical Engineering') {
        await db.from('professors').update({
            department: 'Pending Update',
            school: 'Manipal Institute of Technology',
            cabin: 'Not Provided Online'
        }).eq('id', wrongData[0].id);
        console.log('Reverted:', wrongData[0].name);
    }

    // 2. Find and update the correct Dr. S. Raja
    let { data: rajaData } = await db.from('professors').select('id, name, mail').ilike('mail', 'raja.s@manipal.edu');
    if (rajaData && rajaData.length > 0) {
        await db.from('professors').update({
            cabin: 'AB2-Ground Floor-NC-10',
            department: 'Chemical Engineering',
            school: 'Civil and Chemical Engineering'
        }).eq('id', rajaData[0].id);
        console.log('Updated Dr. S. Raja:', rajaData[0].name);
    } else {
        // Try broader search
        let { data: rajaData2 } = await db.from('professors').select('id, name, mail').ilike('name', '%S. Raja%');
        if (!rajaData2 || rajaData2.length === 0) {
            let { data: rajaData3 } = await db.from('professors').select('id, name, mail').ilike('name', '%Raja%');
            console.log('Raja search results:', rajaData3 ? rajaData3.map(d => `${d.name} (${d.mail})`).join(', ') : 'none');
        } else {
            console.log('Raja results:', rajaData2.map(d => `${d.name} (${d.mail})`));
        }
    }

    // 3. Find and update Dr. V Anoop Kishore (uses gmail)
    let { data: anoopData } = await db.from('professors').select('id, name, mail').ilike('name', '%Anoop%Kishore%');
    if (anoopData && anoopData.length > 0) {
        await db.from('professors').update({
            cabin: 'AB2-Ground Floor-NC-20',
            department: 'Chemical Engineering',
            school: 'Civil and Chemical Engineering'
        }).eq('id', anoopData[0].id);
        console.log('Updated Anoop Kishore:', anoopData[0].name);
    } else {
        let { data: anoopData2 } = await db.from('professors').select('id, name, mail').ilike('name', '%Anoop%');
        console.log('Anoop search:', anoopData2 ? anoopData2.map(d => `${d.name} (${d.mail})`).join(', ') : 'none');
    }
}

fixChemEng();
