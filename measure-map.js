// Node.js script to measure world map image dimensions
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

// Simple PNG header reader to extract dimensions
function readPNGDimensions(buffer) {
  // PNG files start with signature: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.length < 24) {
    throw new Error('Invalid PNG file - too small');
  }
  
  // Check PNG signature
  const signature = buffer.slice(0, 8);
  const expectedSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  if (!signature.equals(expectedSignature)) {
    throw new Error('Invalid PNG file - wrong signature');
  }
  
  // IHDR chunk starts at byte 8, dimensions are at bytes 16-23
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  
  return { width, height };
}

async function measureWorldMap() {
  try {
    console.log('🗺️  Measuring World Map Image Dimensions...\n');
    
    // Read the PNG file
    const fs = await import('fs/promises');
    const imagePath = './public/images/world-map.png';
    
    console.log(`📁 Reading file: ${imagePath}`);
    const buffer = await fs.readFile(imagePath);
    
    console.log(`📊 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
    
    // Extract dimensions
    const dimensions = readPNGDimensions(buffer);
    const aspectRatio = (dimensions.width / dimensions.height).toFixed(2);
    
    console.log('\n✅ MEASUREMENT RESULTS:');
    console.log('═'.repeat(50));
    console.log(`📐 Width:        ${dimensions.width}px`);
    console.log(`📐 Height:       ${dimensions.height}px`);
    console.log(`📐 Aspect Ratio: ${aspectRatio}:1`);
    console.log('═'.repeat(50));
    
    console.log('\n🔧 COORDINATE CONVERSION CODE:');
    console.log('─'.repeat(40));
    console.log(`const MAP_WIDTH = ${dimensions.width};`);
    console.log(`const MAP_HEIGHT = ${dimensions.height};`);
    console.log('');
    console.log('const convertToPercentage = (pixelX, pixelY) => ({');
    console.log('  x: (pixelX / MAP_WIDTH) * 100,');
    console.log('  y: (pixelY / MAP_HEIGHT) * 100');
    console.log('});');
    console.log('─'.repeat(40));
    
    console.log('\n🇨🇦 EXAMPLE: Canada Coordinates');
    const canadaX = 303;
    const canadaY = 259;
    const canadaPercentX = ((canadaX / dimensions.width) * 100).toFixed(2);
    const canadaPercentY = ((canadaY / dimensions.height) * 100).toFixed(2);
    
    console.log(`   Pixel coords:      x: ${canadaX}, y: ${canadaY}`);
    console.log(`   Percentage coords: x: ${canadaPercentX}%, y: ${canadaPercentY}%`);
    
    console.log('\n🇺🇸 EXAMPLE: United States Coordinates');
    const usaX = 315;
    const usaY = 377;
    const usaPercentX = ((usaX / dimensions.width) * 100).toFixed(2);
    const usaPercentY = ((usaY / dimensions.height) * 100).toFixed(2);
    
    console.log(`   Pixel coords:      x: ${usaX}, y: ${usaY}`);
    console.log(`   Percentage coords: x: ${usaPercentX}%, y: ${usaPercentY}%`);
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Use these dimensions in your coordinate conversion utility');
    console.log('2. Convert all 130 countries from pixel to percentage coordinates');
    console.log('3. Update InteractiveWorldMap component with accurate positioning');
    console.log('4. Test with debug rectangles to verify alignment\n');
    
    return dimensions;
    
  } catch (error) {
    console.error('❌ Error measuring image:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('- Make sure the file exists at: ./public/images/world-map.png');
    console.log('- Verify the file is a valid PNG image');
    console.log('- Check file permissions\n');
  }
}

// Run the measurement
measureWorldMap();