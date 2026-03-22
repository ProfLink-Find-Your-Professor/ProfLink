const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log("Analyzing Database for accidental cross-department updates...");
    const { data: taintedProfs } = await db.from('professors').select('*').contains('courses_taught', ['Mathematics']);
    let reverted = 0;
    
    if (taintedProfs && taintedProfs.length > 0) {
        for(const p of taintedProfs) {
            if(!p.department.toLowerCase().includes('basic')) {
                // Revert
                const newCourses = p.courses_taught.filter(c => c !== 'Mathematics');
                await db.from('professors').update({
                    cabin: "Not Provided Online",
                    courses_taught: newCourses
                }).eq('id', p.id);
                console.log(`[REVERTED] Cleaned up: ${p.name} from ${p.department}`);
                reverted++;
            }
        }
    }
    console.log(`Done! Reverted ${reverted} mismatched professors.`);
}
fix();
