const fs = require('fs');
const path = require('path');
try { fs.unlinkSync(path.join(__dirname, '../public/sounds/page-flip.mp3')); console.log('Deleted'); } catch (e) {}
