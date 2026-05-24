const { Jimp } = require('jimp');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');

async function main() {
  try {
    const width = 400;
    const height = 400;
    
    // Read our custom icon
    const icon = await Jimp.read('build/icon-true.png');
    
    const encoder = new GIFEncoder(width, height);
    encoder.createReadStream().pipe(fs.createWriteStream('build/loading.gif'));
    
    encoder.start();
    encoder.setRepeat(0);   // loop indefinitely
    encoder.setDelay(80);   // ms per frame
    
    // Generate 20 frames for a smooth pulse animation
    for (let i = 0; i < 20; i++) {
      // Create a fresh dark premium background for each frame
      const frameBg = new Jimp({ width, height, color: 0x0d0f14ff });
      
      // Calculate scale (pulse from 1.0 to 1.1 and back)
      let scale = 1.0 + Math.sin((i / 20) * Math.PI) * 0.1;
      
      const frameIcon = icon.clone();
      const newW = Math.round(140 * scale);
      const newH = Math.round(140 * scale);
      
      frameIcon.resize({ w: newW, h: newH });
      
      // Center the icon
      frameBg.composite(frameIcon, (width - newW) / 2, (height - newH) / 2);
      
      // Add frame
      encoder.addFrame(frameBg.bitmap.data);
    }
    
    encoder.finish();
    console.log("Premium animated loading.gif created successfully!");
  } catch (err) {
    console.error("Failed to create loading.gif:", err);
    process.exit(1);
  }
}

main();
