const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';
const db = createClient(supabaseUrl, supabaseKey);

const chemEngFaculty = [
    { email: "raja.s@manipal.edu", cabin: "NC-10" },
    { email: "harish.kumar@manipal.edu", cabin: "NC-01" },
    { email: "krishna.bandaru@manipal.edu", cabin: "NC-02" },
    { email: "srinivas.kini@manipal.edu", cabin: "NC-03" },
    { email: "ramesh.v@manipal.edu", cabin: "NC-04" },
    { email: "shan.priya@manipal.edu", cabin: "NC-12" },
    { email: "cr.girish@manipal.edu", cabin: "NC-08" },
    { email: "muddu.m@manipal.edu", cabin: "NC-11" },
    { email: "harshini.dasari@manipal.edu", cabin: "NC-09" },
    { email: "gautham.jeppu@manipal.edu", cabin: "NC-07" },
    { email: "ranjeet.mishra@manipal.edu", cabin: "NC-05" },
    { email: "vairavel.p@manipal.edu", cabin: "NC-15" },
    { email: "nethaji.s@manipal.edu", cabin: "NC-16" },
    { email: "lavanya.m@manipal.edu", cabin: "NC-06" },
    { email: "anoopkishore.v@gmail.com", cabin: "NC-20" },
    { email: "pm.kumaran@manipal.edu", cabin: "NC-14" },
    { email: "sriprasad.acharya@manipal.edu", cabin: "NC-13" },
    { email: "laxman.kumar@manipal.edu", cabin: "12" },
    { email: "sandeep.parma@manipal.edu", cabin: "NC-18" },
    { email: "jitendra.carpenter@manipal.edu", cabin: "NC-21" },
    { email: "shettigar.suma@manipal.edu", cabin: "NC-19" },
    { email: "srikanth.divi@manipal.edu", cabin: "NC-17" }
];

async function updateChemEng() {
    let matched = 0;
    
    for (const f of chemEngFaculty) {
        const emailPrefix = f.email.split('@')[0];
        
        let { data, error } = await db.from('professors')
            .select('id, name, mail')
            .ilike('mail', `%${emailPrefix}%`);
        
        if (error) {
            console.error(`Error searching ${f.email}:`, error.message);
            continue;
        }
        
        if (data && data.length > 0) {
            const prof = data[0];
            const cabinStr = `AB2-Ground Floor-${f.cabin}`;
            
            const { error: updateErr } = await db.from('professors').update({
                cabin: cabinStr,
                department: 'Chemical Engineering',
                school: 'Civil and Chemical Engineering'
            }).eq('id', prof.id);
            
            if (updateErr) {
                console.error(`Failed ${prof.name}:`, updateErr.message);
            } else {
                console.log(`[SUCCESS] ${prof.name} (${prof.mail}) -> ${cabinStr}`);
                matched++;
            }
        } else {
            console.log(`[NOT FOUND] Email: ${f.email}`);
        }
    }
    
    console.log(`\nFinished. Updated ${matched}/${chemEngFaculty.length} professors.`);
}

updateChemEng();
