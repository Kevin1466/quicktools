const fs = require('fs');
const path = 'src/pages/tools/data/SocialInsuranceCalculator.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace non-breaking spaces (U+00A0) and ideographic spaces (U+3000) with normal spaces
const originalLength = content.length;
content = content.replace(/\xA0/g, ' ');
content = content.replace(/\u3000/g, ' ');

fs.writeFileSync(path, content, 'utf8');
console.log('Cleaned up whitespace. File length changed from ' + originalLength + ' to ' + content.length);
