const Tesseract = require('tesseract.js');
const fs = require('fs');

Tesseract.recognize(
  'Chemical Engineering/WhatsApp Image 2026-03-23 at 5.54.08 PM.jpeg',
  'eng',
  { logger: m => {} } // silences the verbose progress output
).then(({ data: { text } }) => {
  fs.writeFileSync('Chemical Engineering/chem_ocr.txt', text);
  console.log("OCR finished successfully! Wrote to chem_ocr.txt");
}).catch(err => {
  console.error("OCR Error:", err);
});
