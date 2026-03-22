const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';

async function testUpload() {
    const prof = {
        id: "prof_abhay_shetty_test_2",
        name: "Dr. Abhay Shetty",
        department: "School of Basic Sciences",
        image: "test",
        cabin: "test",
        mail: "test@x",
        contact: "test",
        qualifications: "test",
        occupation: "test",
        bio: "test",
        education: [],
        research: ["AI"],
        courses_taught: [],
        awards: [],
        publications: ["p"],
        linkedin_url: "",
        google_scholar_url: "",
        tags: []
    };

    const res = await fetch(supabaseUrl, {
        method: 'POST',
        headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(prof)
    });
    
    if(!res.ok) {
        console.error("Failed to upload:", await res.text());
    } else {
        console.log("Success with full payload!");
    }
}
testUpload();
