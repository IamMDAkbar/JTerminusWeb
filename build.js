const fs = require('fs');
const path = require('path');

const dest = path.join(__dirname, 'public');

// Ensure /public exists
if (!fs.existsSync(dest)) fs.mkdirSync(dest);

// Copy index.html
fs.copyFileSync('index.html', path.join(dest, 'index.html'));

// Copy folders if they exist
['css', 'js'].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.mkdirSync(path.join(dest, dir), { recursive: true });
    fs.readdirSync(dir).forEach(file => {
      fs.copyFileSync(path.join(dir, file), path.join(dest, dir, file));
    });
  }
});

console.log('✅ Build completed. Files copied to /public');
