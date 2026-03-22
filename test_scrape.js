const cheerio = require('cheerio');
async function test() {
    const res = await fetch('https://www.manipal.edu/mit/department-faculty/faculty-list/yogesh-pai-p.html');
    const html = await res.text();
    const $ = cheerio.load(html);
    console.log("Images:");
    $('img').each((i, el) => console.log('   ', $(el).attr('src')));
    
    // Find text nodes containing Qualification
    let qual = '';
    $('body *').contents().each((i, el) => {
        if(el.type === 'text' && el.data.includes('Qualification:')) {
            qual = el.data.trim();
        }
    });
    console.log("Qual:", qual);
    
    // Find Area of interest
    $('h4, h3, h5, p, div, span').each((i, el) => {
        const text = $(el).text();
        if(text.includes('Area of Interest') || text.includes('Area of Research')) {
            console.log("Area text:", text.substring(0, 100).replace(/\n/g, ' '));
        }
    });
}
test();
