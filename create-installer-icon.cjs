const { Jimp } = require('jimp');

async function main() {
  try {
    const baseIcon = await Jimp.read('build/icon-true.png');
    
    // Create a new 80x80 blue badge for the download icon
    const badge = new Jimp({ width: 80, height: 80, color: 0x4caf50ff }); // Green circle
    badge.circle();
    
    // Draw a white arrow on the badge
    // Vertical stem
    for (let y = 20; y < 50; y++) {
      for (let x = 36; x < 44; x++) {
        badge.setPixelColor(0xffffffff, x, y);
      }
    }
    // Arrow head
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15 - i; j++) {
        badge.setPixelColor(0xffffffff, 39 - j, 45 + i);
        badge.setPixelColor(0xffffffff, 40 + j, 45 + i);
      }
    }
    
    // Composite over the base icon (bottom right corner)
    baseIcon.composite(badge, 160, 160);
    
    await baseIcon.write('build/installer-icon-true.png');
    console.log('Successfully patched download icon over base icon.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
