// Run: node generate-icons.js
// Generates PWA icons using canvas (Node.js)
// If this doesn't work, just use any 192x192 and 512x512 PNG image

const { createCanvas } = require('canvas');
const fs = require('fs');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1e40af';
  const radius = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Text
  ctx.fillStyle = 'white';
  ctx.font = `900 ${size * 0.45}px Arial Black`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PH', size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/${filename}`, buffer);
  console.log(`Generated ${filename}`);
}

try {
  generateIcon(192, 'icon-192.png');
  generateIcon(512, 'icon-512.png');
} catch (e) {
  console.log('canvas module not available - creating simple placeholder');
}
