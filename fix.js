const fs = require('fs');
let data = fs.readFileSync('locales/ar.json', 'utf8');
data = data.replace(/"٨"/g, '"۸"');
fs.writeFileSync('locales/ar.json', data, 'utf8');
console.log('Fixed ar.json');
