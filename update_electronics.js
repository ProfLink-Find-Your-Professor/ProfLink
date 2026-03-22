const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

const facultyList = [
    { name: "Dr. Pallavi R Mane", room: "Faculty Rooms 3", chamber: "Chamber 23" },
    { name: "Dr. Kumara Shama", room: "Faculty Rooms 4", chamber: "Chamber 56" },
    { name: "Dr. Somashekara Bhat", room: "Faculty Rooms 2", chamber: "Chamber 19" },
    { name: "Dr. M. Sathish Kumar", room: "Faculty Rooms 3", chamber: "Chamber 20" },
    { name: "Dr. Dayananda Nayak", room: "Faculty Rooms 4", chamber: "Chamber 53" },
    { name: "Dr. G. Subramanya Nayak", room: "Faculty Rooms 3", chamber: "Chamber 33" },
    { name: "Dr. Kanthi M", room: "Faculty Rooms 3", chamber: "Chamber 28" },
    { name: "Dr. Pramod Kumar", room: "Faculty Rooms 3", chamber: "Chamber 21" },
    { name: "Dr. Vinod Kumar Joshi", room: "Faculty Rooms 4", chamber: "Chamber 55" },
    { name: "Dr. Shankarnarayana Bhat M.", room: "Faculty Rooms 4", chamber: "Chamber 52" },
    { name: "Dr. Bore Gowda S.B", room: "Faculty Rooms 2", chamber: "Chamber 09" },
    { name: "Dr. Krishnamurthy Nayak", room: "Faculty Rooms 2", chamber: "Chamber 08" },
    { name: "Dr. R. Vinoth", room: "Faculty Rooms 3", chamber: "Chamber 25" },
    { name: "Dr. Shounak De", room: "Faculty Rooms 2", chamber: "Chamber 11" },
    { name: "Dr. Sampath Kumar", room: "Faculty Rooms 4", chamber: "Chamber 65" },
    { name: "Dr. Ujjwal Verma", room: "Faculty Rooms 1", chamber: "Chamber 03" },
    { name: "Dr. Ramya S", room: "Faculty Rooms 3", chamber: "Chamber 49" },
    { name: "Dr. Shailendra Kumar Tiwari", room: "Faculty Rooms 2", chamber: "Chamber 12" },
    { name: "Dr. Ravilla Dilli", room: "Faculty Rooms 4", chamber: "Chamber 54" },
    { name: "Dr. Ananthakrishna T", room: "Faculty Rooms 4", chamber: "Chamber 51" },
    { name: "Dr. Tanweer", room: "Faculty Rooms 3", chamber: "Chamber 29" },
    { name: "Dr. Aparna U.", room: "Faculty Rooms 3", chamber: "Chamber 30" },
    { name: "Dr. Goutham Simha G D", room: "Faculty Rooms 2", chamber: "Chamber 14" },
    { name: "Dr. Sudheesh P G", room: "Faculty Rooms 3", chamber: "Chamber 24" },
    { name: "Dr. Rajiv Mohan David", room: "Faculty Rooms 3", chamber: "Chamber 41" },
    { name: "Mr. Vasanth Kumar P", room: "Faculty Rooms 1", chamber: "Chamber 04" },
    { name: "Mr. Vishnumurthy Kedlaya K", room: "Faculty Rooms 3", chamber: "Chamber 22" },
    { name: "Mr. H. Srikanth Kamath", room: "Faculty Rooms 2", chamber: "Chamber 13" },
    { name: "Dr. Jagadeesh Chandra R.B", room: "Faculty Rooms 3", chamber: "Chamber 27" },
    { name: "Mr. Prashant M Prabhu", room: "Faculty Rooms 3", chamber: "Chamber 37" },
    { name: "Dr. Shashi Kumar G.S", room: "Faculty Rooms 3", chamber: "Chamber 32" },
    { name: "Dr. Supreetha B.S", room: "Faculty Rooms 2", chamber: "Chamber 10" },
    { name: "Dr. Ramasamy S", room: "Faculty Rooms 3", chamber: "Chamber 44" },
    { name: "Mr. Vijay S.R", room: "Faculty Rooms 3", chamber: "Chamber 31" },
    { name: "Mr. Nakul Shetty K", room: "Faculty Rooms 3", chamber: "Chamber 50" },
    { name: "Ms. K.T. Navya", room: "Faculty Rooms 3", chamber: "Chamber 46" },
    { name: "Mr. Shreeharsha K.G", room: "Faculty Rooms 3", chamber: "Chamber 38" },
    { name: "Ms. Divya B", room: "Faculty Rooms 2", chamber: "Chamber 15" },
    { name: "Mr. Suhas M.V", room: "Faculty Rooms 3", chamber: "Chamber 36" },
    { name: "Dr. Om Prakash Kumar", room: "Faculty Rooms 4", chamber: "Chamber 66" },
    { name: "Mr. Suhas K", room: "Faculty Rooms 3", chamber: "Chamber 39" },
    { name: "Dr. Muralikrishna H", room: "Faculty Rooms 1", chamber: "Chamber 02" },
    { name: "Ms. Aparna V", room: "Faculty Rooms 3", chamber: "Chamber 47" },
    { name: "Dr. Akshatha K.R", room: "Faculty Rooms 1", chamber: "Chamber 01" },
    { name: "Ms. Soumya S", room: "Faculty Rooms 1", chamber: "Chamber 05" },
    { name: "Mr. C. Sivananda Reddy", room: "Faculty Rooms 3", chamber: "Chamber 26" },
    { name: "Dr. Yashwanth N", room: "Faculty Rooms 3", chamber: "Chamber 34" },
    { name: "Dr. Amit Kumar Goyal", room: "Faculty Rooms 3", chamber: "Chamber 43" },
    { name: "Dr. Atanu Das", room: "Faculty Rooms 3", chamber: "Chamber 42" },
    { name: "Mr. A. Gopalakrishna Pai", room: "Faculty Rooms 4", chamber: "Chamber 63" },
    { name: "Dr. Karthi Pradeep", room: "Faculty Rooms 3", chamber: "Chamber 40" },
    { name: "Dr. Anu Shaju Areeckal", room: "Faculty Rooms 2", chamber: "Chamber 18" },
    { name: "Dr. Rahul Ratnakumar", room: "Faculty Rooms 1", chamber: "Chamber 06" },
    { name: "Dr. Bhaskar Awadhiya", room: "Faculty Rooms 4", chamber: "Chamber 57" },
    { name: "Dr. Bhavanari Mallikarjun", room: "Faculty Rooms 2", chamber: "Chamber 16" },
    { name: "Dr. Arjun Sunil Rao", room: "Faculty Rooms 4", chamber: "Chamber 64" },
    { name: "Dr. Praveen Kumar", room: "Faculty Rooms 3", chamber: "Chamber 48" },
    { name: "Dr. Adarsh Nigam", room: "Faculty Rooms 1", chamber: "Chamber 03" },
    { name: "Dr. Pramod Martha", room: "Faculty Rooms 2", chamber: "Chamber 17" }
];

function normalizeName(name) {
    return name.replace(/^(Dr\.|Mr\.|Ms\.|Dr|Mr|Ms)\s+/i, '').replace(/[^a-zA-Z]/g, '').toLowerCase();
}

async function start() {
    let { data: allProfs, error } = await db.from('professors').select('id, name, department, school, cabin');
    if(error) {
        console.error("Failed to fetch professors: ", error);
        return;
    }

    let updatedCount = 0;
    
    for (let f of facultyList) {
        let normName = normalizeName(f.name);
        
        let matches = allProfs.filter(p => {
            let pNorm = normalizeName(p.name || '');
            // match if normalized names are very close or substrings
            return pNorm.includes(normName) || normName.includes(pNorm);
        });
        
        // If we get multiple hits, we can filter by department indicating something electronic if possible, but let's see.
        let actualMatch = null;
        if (matches.length === 1) {
            actualMatch = matches[0];
        } else if (matches.length > 1) {
            // Further tie-breaking: prefer those already in some electronics dept
            let strictMatches = matches.filter(m => (m.department && m.department.toLowerCase().includes('electron')) || (m.school && m.school.toLowerCase().includes('electr')));
            if(strictMatches.length === 1) {
                actualMatch = strictMatches[0];
            } else {
                console.log(`[WARNING] Multiple hits for ${f.name}: ` + matches.map(m=>m.name).join(', '));
            }
        } else {
            console.log(`[MISSING] Could not find ${f.name}`);
        }
        
        if(actualMatch) {
            let formattedCabin = `AB5 - Ground Floor - ${f.room} - ${f.chamber}`;
            
            // Format provided by user: "AB5 - Ground Floor - Faculty Rooms x - Chamber y"
            // "school is Electrical Engineering"
            // "department update as Electronics"
            
            let updates = {
                cabin: formattedCabin,
                school: "Electrical Engineering",
                department: "Electronics"
            };
            
            const { error: updErr } = await db.from('professors').update(updates).eq('id', actualMatch.id);
            if(!updErr) {
                console.log(`[UPDATED] ${f.name} (Matched: ${actualMatch.name})`);
                updatedCount++;
            } else {
                console.log(`[ERROR] Failed to update ${f.name}: ${updErr.message}`);
            }
        }
    }
    console.log(`\nDONE! Updated ${updatedCount} out of ${facultyList.length}`);
}

start();
