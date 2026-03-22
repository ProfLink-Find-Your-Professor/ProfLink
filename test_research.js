const cheerio = require('cheerio');

async function test() {
    const res = await fetch('https://www.manipal.edu/mit/department-faculty/faculty-list/nitesh-naik.html');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Print the raw HTML string around 'Area of Research' to analyze the DOM structure
    const idx = html.indexOf('Area of Research');
    if(idx !== -1) {
       console.log("HTML structure around 'Area of Research':");
       console.log(html.substring(Math.max(0, idx - 100), Math.min(html.length, idx + 800)));
    }
}
test();
