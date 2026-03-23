const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function finalChemUpdates() {
    const updates = [
        { nameQuery: 'Santosh Laxman Gaonkar', cabin: 'AB2-Ground Floor-CHM-05' },
        { nameQuery: 'Anil Kumar N V', cabin: 'AB2-Ground Floor-CHM-04' },
        { nameQuery: 'Fasiulla', cabin: 'AB2-Ground Floor-CHM-01' },
        { nameQuery: 'Nitinkumar S Shetty', cabin: 'AB2-Ground Floor-CHM-15' }
    ];
    
    for (const u of updates) {
        let { data } = await db.from('professors').select('id, name').ilike('name', `%${u.nameQuery}%`);
        if (data && data.length > 0) {
            await db.from('professors').update({
                department: 'Chemistry',
                school: 'School of Basic Sciences, Humanities and Management',
                cabin: u.cabin
            }).eq('id', data[0].id);
            console.log(`Updated ${data[0].name} -> ${u.cabin}`);
        }
    }
}

finalChemUpdates();
