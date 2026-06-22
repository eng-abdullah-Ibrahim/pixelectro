const fs = require('fs');
let data = fs.readFileSync('locales/ar.json', 'utf8');
data = data.replace(/"٢٠٢٣"/g, '"۲۰۲۳"');
fs.writeFileSync('locales/ar.json', data, 'utf8');
console.log('Fixed 2023 in ar.json');
