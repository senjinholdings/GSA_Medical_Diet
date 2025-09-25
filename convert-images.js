const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const PROJECT_ROOT = __dirname;
const TARGET_DIR = path.join(PROJECT_ROOT);
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'playwright-report', 'test-results']);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

async function collectImages(dir, results = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      await collectImages(fullPath, results);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function convertToWebP() {
  const images = await collectImages(TARGET_DIR);
  if (!images.length) {
    console.log('No PNG/JPG images found.');
    return;
  }
  console.log(`Found ${images.length} image(s). Starting conversion...`);

  for (const imagePath of images) {
    const outputPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    try {
      console.log(`→ Converting ${path.relative(PROJECT_ROOT, imagePath)} → ${path.relative(PROJECT_ROOT, outputPath)}`);
      await sharp(imagePath).webp({ quality: 80 }).toFile(outputPath);
      console.log('  ✓ Done');
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}`);
    }
  }

  console.log('Conversion completed!');
}

convertToWebP().catch((error) => {
  console.error('Unexpected error during conversion:', error);
  process.exit(1);
});
