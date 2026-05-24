const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const inputPath = 'C:\\Users\\shrey\\.gemini\\antigravity\\brain\\1100a9ac-6be2-42a4-9c07-8da782b3fa79\\pomodoro_icon_1779655794616.png';
const outputDir = path.join(__dirname, 'build');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Copy the original PNG to build folder
fs.copyFileSync(inputPath, path.join(outputDir, 'icon.png'));

pngToIco(inputPath)
  .then(buf => {
    fs.writeFileSync(path.join(outputDir, 'icon.ico'), buf);
    console.log('Successfully generated icon.ico');
  })
  .catch(console.error);
