const https = require('https');
const fs = require('fs');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function run() {
  const assetsDir = './public/assets';
  
  // Remove old blocky models
  if (fs.existsSync(assetsDir + '/AntiqueCamera.glb')) fs.unlinkSync(assetsDir + '/AntiqueCamera.glb');
  if (fs.existsSync(assetsDir + '/DamagedHelmet.glb')) fs.unlinkSync(assetsDir + '/DamagedHelmet.glb');
  if (fs.existsSync(assetsDir + '/BrainStem.glb')) fs.unlinkSync(assetsDir + '/BrainStem.glb');

  // We will download highly detailed photorealistic models from three.js repo
  console.log('Downloading high-fidelity modern assets...');
  
  // 1. Robot Expressive for Cybernetic Mesh / VFX
  await download('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/RobotExpressive/RobotExpressive.glb', assetsDir + '/cybernetic_core.glb');
  
  // 2. LeePerrySmith realistic head scan for AI / Brain
  await download('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb', assetsDir + '/realistic_head.glb');
  
  // 3. LittlestTokyo for highly detailed structural mesh
  await download('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/LittlestTokyo.glb', assetsDir + '/detailed_mesh.glb');

  console.log('Successfully downloaded ultra-realistic models.');
}

run();
