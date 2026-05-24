const fs = require('fs');
const source = 'C:\\Users\\shrey\\.gemini\\antigravity\\brain\\1100a9ac-6be2-42a4-9c07-8da782b3fa79\\pomodoro_icon_1779655794616.png';
const target = './build/icon.png';

fs.copyFileSync(source, target);
console.log('Copied successfully.');

const buf = fs.readFileSync(target);
console.log('Signature:', buf.slice(0, 8).toString('hex'));
