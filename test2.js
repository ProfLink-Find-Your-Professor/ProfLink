const cheerio = require('cheerio');
async function test() {
    const res = await fetch('https://www.manipal.edu/mit/department-faculty.html');
    const html = await res.text();
    const $ = cheerio.load(html);
    const links = new Set();
    $('a[href*="/faculty-list/"]').each((i, el) => {
        links.add($(el).attr('href'));
    });
    console.log("Faculty links found:", links.size);
    // Also look for department links just in case
    const deptLinks = new Set();
    $('a[href*="/department-list/"]').each((i, el) => {
        deptLinks.add($(el).attr('href'));
    });
    console.log("Dept links found:", deptLinks.size);
}
test();
