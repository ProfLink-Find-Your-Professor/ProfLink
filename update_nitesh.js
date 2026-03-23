const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function updateNitesh() {
    let { data } = await db.from('professors').select('id, name').ilike('name', 'Dr. Nitesh Kumar');
    
    if (data && data.length > 0) {
        await db.from('professors').update({
            department: 'Humanities and Management',
            school: 'Basic sciences , humanities and management',
            cabin: 'AB2-First Floor- Faculty Cabin 05- FC 31'
        }).eq('id', data[0].id);
        console.log("Updated", data[0].name);
    }
}

updateNitesh();
