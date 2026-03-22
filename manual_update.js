const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function manualUpdates() {
    let updates = [
        {
            id: 'prof_enaganti-prasanth-kumar---department-of-electronics---electrical',
            cabin: 'AB5 - Ground Floor - Faculty Rooms 1 - Chamber 04', // Vasanth Kumar P
            school: 'Electrical Engineering',
            department: 'Electronics'
        },
        {
            id: 'prof_Praveen_Kumar',
            cabin: 'AB5 - Ground Floor - Faculty Rooms 3 - Chamber 48', // Praveen Kumar
            school: 'Electrical Engineering',
            department: 'Electronics'
        },
        {
            id: 'prof_pramod-k-',
            cabin: 'AB5 - Ground Floor - Faculty Rooms 3 - Chamber 21', // Pramod Kumar
            school: 'Electrical Engineering',
            department: 'Electronics'
        }
    ];

    for (let u of updates) {
        let { error } = await db.from('professors').update({
            cabin: u.cabin,
            school: u.school,
            department: u.department
        }).eq('id', u.id);
        
        if (error) {
            console.log("Failed: " + u.id, error);
        } else {
            console.log("Updated: " + u.id);
        }
    }
}
manualUpdates();
