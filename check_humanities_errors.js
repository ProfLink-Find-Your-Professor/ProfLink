const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

async function checkWronglyUpdated() {
    const { data: currentHums } = await db.from('professors')
        .select('id, name')
        .eq('department', 'Humanities and Management');
        
    console.log(`Found ${currentHums ? currentHums.length : 0} currently marked as Humanities.`);
    
    // Original list
    const text = fs.readFileSync('Humanities/humanities_text.txt', 'utf-8');
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const facultyLines = lines.slice(1, 41);
    
    const validNamesSet = facultyLines.map(raw => {
        let name = raw.replace(' School of Basic Sciences Humanities and Management', '').trim();
        name = name.replace(/^Dr\.\s*/, '').replace(/^Mr\.\s*/, '').replace(/^Ms\.\s*/, '').replace(/^Lt\.\s*Cdr\s*/, '');
        return name.toLowerCase().replace(/[^a-z0-9]/g, '');
    });

    const wronglyUpdated = [];
    
    for (const prof of currentHums || []) {
        let dbNameVal = prof.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        let isValid = false;
        for (const vName of validNamesSet) {
            if (dbNameVal.includes(vName) || vName.includes(dbNameVal)) {
                isValid = true;
                break;
            }
        }
        
        // Manual check for some known edge cases like Geethalakshmi
        if (prof.name.toLowerCase().includes('geetha') || prof.name.toLowerCase().includes('adithi')) {
            isValid = true;
        }

        if (!isValid) {
            wronglyUpdated.push(prof);
        }
    }
    
    console.log("Wrongly updated count:", wronglyUpdated.length);
    for (const w of wronglyUpdated) {
        console.log("- ", w.name);
    }
}

checkWronglyUpdated();
