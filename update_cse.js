const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

function formatCabin(raw) {
    if(!raw) return "Not Provided Online";
    if(raw.toLowerCase().includes('study leave')) return 'Study Leave';
    raw = raw.toUpperCase();
    
    // Building
    let building = "AB5"; 
    let bMatch = raw.match(/AB[-\s]?(\d)/i);
    if(bMatch) building = `AB${bMatch[1]}`;
    
    // Floor
    let floor = "First Floor";
    if (raw.includes('GROUND')) floor = "Ground Floor";
    else if (raw.includes('III') || raw.includes('3RD') || raw.includes('THIRD')) floor = "Third Floor";
    else if (raw.includes('4TH') || raw.includes('FOURTH')) floor = "Fourth Floor";
    else if (raw.includes('-2')) floor = "-2 Floor";
    
    // Faculty Room
    let fRoomStr = "";
    let roomMatch = raw.match(/FACULTY ROOMS\s+(\d+)/i);
    if(roomMatch && roomMatch[1]) {
        fRoomStr = `Faculty Rooms ${roomMatch[1]}-`;
    }
    
    // Chamber
    let chamber = "Chamber TBD";
    
    // First, check explicit parenthesized FC: e.g. SCE/FC 136 (FC 10) -> Chamber 10
    let parenMatch = raw.match(/\(FC\s*(\d+)\)/i);
    if (parenMatch && parenMatch[1]) {
        chamber = `Chamber ${parenMatch[1]}`;
        // If it starts with SCE/FC 136, we can optionally treat 136 as the Room
        let prefixMatch = raw.match(/SCE\/FC\s*(\d+)/i);
        if (prefixMatch && prefixMatch[1] && !fRoomStr) {
            fRoomStr = `Faculty Rooms ${prefixMatch[1]}-`;
        }
    } else {
        // Otherwise, find the general FC/Chamber number
        let cMatch = raw.match(/SCE\/FC\s*[-]?\s*(\d+)/i) || 
                     raw.match(/FC\s*[-]?\s*(\d+)/i) || 
                     raw.match(/F\/C\s*[-]?\s*(\d+)/i) || 
                     raw.match(/CABIN[-\s]*(NO)?\s*(\d+)/i);
        if (cMatch) {
            let digits = cMatch[cMatch.length - 1];
            if(digits && !digits.match(/NO/i)) chamber = `Chamber ${digits}`;
            else chamber = `Chamber ${cMatch[1]}`; // Fallback grab
        }
    }
    
    // Special exceptions
    if (raw.includes('ICAS')) {
        fRoomStr = 'ICAS Faculty Cabin-';
        let icMatch = raw.match(/CABIN[-\s]*(NO)?\s*(\d+)/i);
        if (icMatch) { 
            chamber = `Chamber ${icMatch[icMatch.length - 1]}`; 
            fRoomStr = 'ICAS-'; 
        }
    }

    return `${building}-${floor}-${fRoomStr}${chamber}`;
}

async function start() {
    const rawData = JSON.parse(fs.readFileSync('cse_data.json', 'utf8'));
    let count = 0;
    
    for(const [email, rawCabinStr] of Object.entries(rawData)) {
        const cleanCabin = formatCabin(rawCabinStr);
        
        const { error } = await db.from('professors').update({ cabin: cleanCabin }).eq('mail', email);
        if(!error) {
            count++;
            console.log(`[UPDATED] ${email} -> ${cleanCabin}`);
        } else {
            console.error(`Failed on ${email}: ${error.message}`);
        }
    }
    console.log(`\nSuccessfully applied exact email matches for ${count} Computer Science professors!`);
}

start();
