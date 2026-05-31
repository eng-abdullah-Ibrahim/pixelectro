const https = require('https');
https.get('https://api.polyhaven.com/assets', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    const assets = JSON.parse(data);
    const cameras = Object.keys(assets).filter(k => k.includes('camera') || k.includes('lens') || k.includes('helmet') || k.includes('brain') || k.includes('mesh') || k.includes('tech'));
    console.log("Matching assets:", cameras);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
