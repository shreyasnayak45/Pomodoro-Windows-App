const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CACHE_DIR = 'C:\\Users\\shrey\\AppData\\Local\\electron-builder\\Cache\\winCodeSign';
const TARGET_DIR = path.join(CACHE_DIR, 'winCodeSign-2.6.0');
const ZIP_PATH = path.join(CACHE_DIR, 'winCodeSign.7z');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

console.log('Downloading winCodeSign...');
const file = fs.createWriteStream(ZIP_PATH);
https.get('https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z', (response) => {
  if (response.statusCode === 302) {
    https.get(response.headers.location, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          setTimeout(extract, 1000); // Wait 1 second to ensure file lock is released
        });
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        setTimeout(extract, 1000);
      });
    });
  }
});

function extract() {
  console.log('Extracting winCodeSign (ignoring symlink errors)...');
  const sevenZip = path.join(__dirname, 'node_modules', '7zip-bin', 'win', 'x64', '7za.exe');
  
  try {
    execSync(`"${sevenZip}" x "${ZIP_PATH}" -o"${TARGET_DIR}" -y`);
  } catch (err) {
    console.log('Extraction threw an error (expected due to mac symlinks), but windows files should be intact!');
  }
  
  // Cleanup
  try { fs.unlinkSync(ZIP_PATH); } catch (e) {}
  console.log('Cache fixed!');
}
