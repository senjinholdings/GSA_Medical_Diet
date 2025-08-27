const sharp = require('sharp');
const path = require('path');

async function convertToWebP() {
  const images = [
    'hifu/images/Tips1_injection-lipolysis.png',
    'hifu/images/Tips2_injection-lipolysis (1).png',
    'hifu/images/Tips3_injection-lipolysis (1).png'
  ];

  for (const imagePath of images) {
    try {
      const outputPath = imagePath.replace('.png', '.webp');
      console.log(`Converting ${imagePath} to ${outputPath}...`);
      
      await sharp(imagePath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      console.log(`✓ Successfully converted ${imagePath}`);
    } catch (error) {
      console.error(`✗ Error converting ${imagePath}:`, error.message);
    }
  }
  
  console.log('Conversion completed!');
}

convertToWebP();
