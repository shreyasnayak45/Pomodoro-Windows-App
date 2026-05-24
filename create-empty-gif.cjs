const fs = require('fs');
const path = require('path');

const base64Gif = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const buffer = Buffer.from(base64Gif, 'base64');

fs.writeFileSync(path.join(__dirname, 'build', 'loading.gif'), buffer);
console.log('Transparent loading.gif created successfully.');
