// Simple icon generator - run with: node generate-icons.js
// Creates placeholder icons with "JN" text (Jaza Nyumba)

const fs = require('fs');
const path = require('path');

// Function to create SVG icon
function createSVGIcon(size, text = 'JN') {
    const fontSize = Math.floor(size * 0.4);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  
  <!-- Text -->
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${fontSize}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="central"
  >${text}</text>
</svg>`;
}

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

console.log('🎨 Generating PWA icons...\n');

sizes.forEach(size => {
    const svg = createSVGIcon(size);
    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(publicDir, filename);
    
    fs.writeFileSync(filepath, svg);
    console.log(`✅ Created ${filename}`);
});

console.log('\n🎉 All icons generated successfully!');
console.log('📁 Location: frontend/public/');
console.log('\n💡 Note: These are SVG files. For better compatibility:');
console.log('   1. Open each in a browser');
console.log('   2. Take screenshot or use browser "Save as PNG"');
console.log('   3. Or use online converter: https://cloudconvert.com/svg-to-png');
console.log('\n🔄 When you have a real logo, just replace these files!');
