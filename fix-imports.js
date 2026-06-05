const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('./app');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('lib/prisma')) {
    content = content.replace(/import\s+prisma\s+from\s+['"].*?lib\/prisma['"]/g, "import prisma from '@/lib/prisma'");
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
});

console.log('Fixed files: ' + count);
