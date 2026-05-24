const { Jimp } = require('jimp');

async function main() {
  try {
    const image = await Jimp.read('build/icon.png');
    // Resize first
    image.resize({ w: 256, h: 256 });
    // Apply circle mask to make corners transparent
    image.circle();
    
    await image.write('build/icon-true.png');
    console.log('Converted to true PNG with transparent circular background successfully!');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
