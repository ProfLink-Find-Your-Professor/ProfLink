const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function checkChemistry() {
    console.log("Fetching Chemistry...");
    const { data: chemistry } = await db.from('professors')
        .select('id, name, department, school')
        .ilike('department', '%Chemistry%');

    console.log(`Found ${chemistry ? chemistry.length : 0} faculties in Chemistry.`);
    if (chemistry && chemistry.length > 0) {
        console.log("Sample:", chemistry[0]);
    }
}
checkChemistry();
