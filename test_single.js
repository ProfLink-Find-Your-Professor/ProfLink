const cheerio = require('cheerio');
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';

async function testUpload() {
    const link = 'https://www.manipal.edu/mit/department-faculty/faculty-list/abhay-shetty.html';
    const pageRes = await fetch(link);
    const pageHtml = await pageRes.text();
    const $p = cheerio.load(pageHtml);
    
    let name = $p('h1').first().text().trim() || $p('.page-title h1').text().trim();
    const prof = {
        id: 'prof_abhay_shetty',
        name: name || 'Test',
        department: 'Test Dept',
        image: '',
        cabin: '',
        mail: '',
        contact: '',
        qualifications: '',
        occupation: '',
        bio: '',
        education: ["test"], // Testing if this is the issue
        research: [],
        courses_taught: [],
        awards: [],
        publications: [],
        linkedin_url: "",
        google_scholar_url: "",
        tags: []
    };

    console.log("Pushing:", prof);

    const res = await fetch(supabaseUrl, {
        method: 'POST',
        headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(prof)
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
}
testUpload();
