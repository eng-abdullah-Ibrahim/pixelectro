const fs = require('fs');
const path = require('path');
fs.renameSync(
  path.join(__dirname, '../public/sounds/page-flip.mp3'),
  path.join(__dirname, '../public/sounds/page-flip.ogg')
);
console.log('Renamed to .ogg');
