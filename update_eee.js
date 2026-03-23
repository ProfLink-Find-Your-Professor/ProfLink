const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

function formatCabin(rawRoom) {
    if (!rawRoom || rawRoom.trim() === '') return 'AB1';
    
    let room = rawRoom.replace(/FC-1/g, 'FC1').replace(/FCI/g, 'FC1').replace(/FC\s*1/g, 'FC1');
    room = room.replace(/FC-2/g, 'FC2').replace(/FC\s*2/g, 'FC2');
    
    // Extract main 3-digit number to determine floor safely (e.g. 219 out of F2/219.4)
    const numMatch = room.match(/\d{3}/);
    let isGround = false;
    let isFirst = false;
    
    if (room.includes('FC1')) {
        isGround = true;
    } else if (numMatch) {
        const num = parseInt(numMatch[0]);
        if (num < 200) {
            isGround = true;
        } else {
            isFirst = true; 
        }
    } else {
        // "and others First FLoor"
        isFirst = true;
    }
    
    let floorStr = isGround ? 'Ground Floor' : 'First Floor';
    
    let fcPart = '';
    if (room.includes('FC1')) {
        fcPart = 'FC1-';
        room = room.replace('FC1', '').trim();
    } else if (room.includes('FC2')) {
        fcPart = 'FC2-';
        room = room.replace('FC2', '').trim();
    }
    
    room = room.replace(/^[\-\/\s]+/, ''); 
    
    if (room === 'AB1' || room === '') {
        return `AB1`;
    }
    
    return `AB1-${floorStr} - ${fcPart}${room}`;
}

async function processEEE() {
    const text = fs.readFileSync('EEE/eee_text.txt', 'utf-8');
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let matched = 0;
    
    for (const line of lines) {
        if (line.includes('Faculty List') || line.startsWith('Page') || line.startsWith('SN Name')) continue;
        
        const emailMatch = line.match(/[a-zA-Z0-9.\-_]+\@[a-zA-Z0-9.\-_]+/);
        let email = emailMatch ? emailMatch[0] : null;
        let roomRaw = '';
        let name = '';
        
        if (email) {
            const parts = line.split(email);
            roomRaw = parts[1].trim();
            name = parts[0].replace(/^\d+/, '').replace(/Dr\.\s*|Mr\.\s*|Ms\.\s*/, '').trim();
        } else if (line.includes('Anjan N Padmasali')) {
             name = 'Anjan N Padmasali';
             email = 'anjan.padmasali@manipal.edu'; 
             roomRaw = 'FC-1 115.2';
        } else {
            continue;
        }
        
        const cabinStr = formatCabin(roomRaw);
        
        // Search by email prefix to be safe against slight domain changes if any, or just name
        const searchEmail = email.split('@')[0];
        
        let { data, error } = await db.from('professors').select('id, name').ilike('mail', `%${searchEmail}%`);
        
        if (error) {
            console.error('Error:', error.message);
            continue;
        }
        
        if (!data || data.length === 0) {
            // fallback to name matching
            const longestPart = name.split(' ').reduce((a, b) => a.length > b.length ? a : b, '');
            if (longestPart.length > 3) {
                const res = await db.from('professors').select('id, name').ilike('name', `%${longestPart}%`);
                if (res.data && res.data.length === 1) {
                    data = res.data;
                }
            }
        }
        
        if (data && data.length > 0) {
            const prof = data[0];
            const { error: updateErr } = await db.from('professors').update({
                cabin: cabinStr,
                department: 'Electrical and Electronics Engineering',
                school: 'Electrical Engineering'
            }).eq('id', prof.id);
            
            if (updateErr) {
                console.error(`Failed ${prof.name}:`, updateErr.message);
            } else {
                console.log(`[SUCCESS] ${prof.name} -> ${cabinStr}`);
                matched++;
            }
        } else {
            console.log(`[NOT FOUND] Email: ${email} | Name: ${name}`);
        }
    }
    
    console.log(`\nFinished executing. Successfully matched and updated ${matched} professors!`);
}

processEEE();
