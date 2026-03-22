const cheerio = require('cheerio');

const url = 'https://www.manipal.edu/mit/department-faculty.html';
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co/rest/v1/professors';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1NTk4MiwiZXhwIjoyMDg5NjMxOTgyfQ.i6dU2rEEceF_37TStVOu9zKchn4d8-Ioq9TwJrpiHY8';

async function uploadToSupabase(prof) {
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
    if(!res.ok) console.error("Failed to upload", prof.name);
}

// Delay helper to avoid overloading requests
const delay = ms => new Promise(res => setTimeout(res, ms));

async function scrape() {
    console.log(`Fetching global directory: ${url}...`);
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Collect unique links
    const linkSet = new Set();
    $('a[href*="/mit/department-faculty/faculty-list/"]').each((i, el) => {
        let l = $(el).attr('href');
        if(!l.startsWith('http')) l = 'https://www.manipal.edu' + l;
        linkSet.add(l);
    });
    
    const links = Array.from(linkSet);
    console.log(`Found ${links.length} unique faculty URLs. Scraping pages concurrently in batches of 30...`);
    
    let count = 0;
    const chunkSize = 30;
    
    for(let i = 0; i < links.length; i += chunkSize) {
        const chunk = links.slice(i, i + chunkSize);
        await Promise.all(chunk.map(async (link) => {
            try {
                const pageRes = await fetch(link);
                const pageHtml = await pageRes.text();
                const $p = cheerio.load(pageHtml);
                
                let name = $p('h1').first().text().trim() || $p('.page-title h1').text().trim();
                if(!name || name.length < 2) return;
                
                let pageTitle = $p('title').text() || '';
                let dept = "Manipal Institute of Technology";
                if (pageTitle.includes('|')) {
                    const parts = pageTitle.split('|');
                    if (parts.length > 1) {
                        dept = parts[1].split(',')[0].replace('- MIT', '').trim();
                    }
                }
                
                let img = '';
                $p('img').each((idx, el) => {
                    let srcAttr = $p(el).attr('src') || $p(el).attr('data-src') || $p(el).attr('srcset') || '';
                    srcAttr = srcAttr.split(' ')[0];
                    if(srcAttr && srcAttr.includes('/content/dam/manipal') && !srcAttr.includes('.svg') && img === '') {
                        img = srcAttr;
                    }
                });
                if(img && !img.startsWith('http')) img = 'https://www.manipal.edu' + img;
                
                // Try to isolate the specific slug after faculty-list/
                let pureSlug = name.replace(/[^a-zA-Z]/g, '').toLowerCase() + '_' + dept.substring(0, 10).replace(/[^a-zA-Z]/g, '').toLowerCase();
                if(link.includes('/faculty-list/')) {
                    const slugPart = link.split('/faculty-list/')[1].split('/')[0].replace('.html', '');
                    if(slugPart && slugPart !== '_jcr_content') {
                        pureSlug = slugPart;
                    }
                }
                const id = 'prof_' + pureSlug;
                
                const textMatch = pageHtml.match(/[a-zA-Z0-9._%+-]+@manipal\.edu/i);
                const mail = textMatch ? textMatch[0].toLowerCase() : 'Not Provided Online';
                
                let occupation = $p('h3').first().text().trim() || $p('h4').first().text().trim() || 'Faculty Member';
                
                let qual = '';
                const qualRegex = /Qualification:\s*([^\n<]+)/i;
                const qualMatch = pageHtml.match(qualRegex);
                if(qualMatch) qual = qualMatch[1].trim();
                
                let research = [];
                let rText = '';
                // Only scan specific specific leaf tags to avoid gigantic wrapper <div>s
                $p('h3, h4, h5, h6, strong, b, p, span').each((idx, el) => {
                    const txt = $p(el).text().trim().toLowerCase();
                    // STRICT heading match only
                    if(txt === 'area of research' || txt === 'areas of research' || 
                       txt === 'area of interest' || txt === 'areas of interest' || 
                       txt === 'area of expertise' || txt === 'areas of expertise' || 
                       txt === 'areas of interest, expertise and research') {
                           
                        // Sometimes the content is inside the SAME paragraph tag
                        let parentText = $p(el).parent().text();
                        if (parentText.length > txt.length && parentText.length < 1000) {
                             rText += " " + parentText;
                        } else {
                            // Otherwise, it's the exact next sibling
                            let nextEl = $p(el).next();
                            while(nextEl.length && !nextEl.text().trim()) {
                                nextEl = nextEl.next();
                            }
                            // Only append if it's not grabbing the massive website footer nav
                            if(nextEl.length && nextEl.text().length < 1000) {
                                rText += " " + nextEl.text();
                            }
                        }
                    }
                });

                if(rText) {
                    let clean = rText.replace(/Area of Interest|Area of Expertise|Area of Research|AREAS OF INTEREST, EXPERTISE AND RESEARCH/gi, '').trim();
                    let rawArr = clean.split(/[,;|\n]/)
                        .map(s => s.replace(/\(Click here\)/gi, '').trim())
                        .filter(s => s.length > 3 && s.length < 150 
                            && !s.toLowerCase().includes('about us') 
                            && !s.toLowerCase().includes('leadership')
                            && !s.toLowerCase().includes('scopus')
                            && !s.toLowerCase().includes('orcid')
                            && !s.toLowerCase().includes('pure profile')
                            && !s.toLowerCase().includes('manipal.edu')
                            && !s.toLowerCase().includes('agree to our privacy')
                        );
                        
                    // Extremely crucial: Deduplicate identical nested text runs triggered by inner DOM sweeps
                    research = Array.from(new Set(rawArr));
                }

                let scopus = '', orcid = '';
                $p('a').each((idx, el) => {
                    const href = $p(el).attr('href') || '';
                    const t = $p(el).text().toUpperCase();
                    if(href.includes('scopus.com') || t.includes('SCOPUS')) scopus = href;
                    if(href.includes('orcid.org') || t.includes('ORCID')) orcid = href;
                });
                
                let linksArr = [];
                if(scopus) linksArr.push("SCOPUS: " + scopus);
                if(orcid) linksArr.push("ORCID: " + orcid);
                
                // Deduplicate publications as well
                linksArr = Array.from(new Set(linksArr));
                
                const prof = {
                    id: id,
                    name: name,
                    department: dept,
                    image: img || "https://i.pravatar.cc/150?u=" + encodeURIComponent(name),
                    cabin: "Not Provided Online",
                    mail: mail,
                    contact: "Not Provided Online",
                    qualifications: qual,
                    occupation: occupation,
                    bio: "Faculty member at " + dept + ".",
                    education: [],
                    research: research,
                    courses_taught: [],
                    awards: [],
                    publications: linksArr,
                    linkedin_url: "",
                    google_scholar_url: "",
                    tags: []
                };
                
                await uploadToSupabase(prof);
                count++;
            } catch(e) {
                console.error("Error scraping link:", link, e.message);
            }
        }));
        
        console.log(`[${count} total] Uploaded batch of ~${chunkSize} profiles...`);
    }
    console.log("Finished superfast scraping of all faculty!");
}

scrape();
