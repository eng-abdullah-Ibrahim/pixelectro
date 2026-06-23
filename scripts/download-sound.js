const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/sounds');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const file = fs.createWriteStream(path.join(dir, 'page-flip.mp3'));
// A reliable Google sounds URL
https.get('https://actions.google.com/sounds/v1/foley/book_page_turn.ogg', function(response) {
  if (response.statusCode === 301 || response.statusCode === 302) {
    https.get(response.headers.location, function(res) {
      res.pipe(file);
      res.on('end', () => console.log('Audio downloaded successfully via redirect'));
    });
  } else {
    response.pipe(file);
    response.on('end', () => console.log('Audio downloaded successfully'));
  }
}).on('error', function(err) {
  console.error("Error downloading audio: ", err.message);
});
