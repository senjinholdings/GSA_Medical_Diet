#!/usr/bin/env node

// Usage: node public/tools/build-available-clinics.js <menu-slug> <output-dir>
// Example: node public/tools/build-available-clinics.js threadlift public/threadlift/data

const fs = require('fs');
const path = require('path');

function main() {
  const [,, menuSlug, outDir] = process.argv;
  if (!menuSlug || !outDir) {
    console.error('Usage: node public/tools/build-available-clinics.js <menu-slug> <output-dir>');
    process.exit(1);
  }

  const globalPath = path.join(process.cwd(), 'public/global-data/global-data.json');
  if (!fs.existsSync(globalPath)) {
    console.error('global-data.json not found. Run: node public/global-data/convert-global-data.js');
    process.exit(1);
  }

  const globalData = JSON.parse(fs.readFileSync(globalPath, 'utf-8'));
  const list = (globalData.menuToClinics?.[menuSlug] || []).filter(c => (c.available || '').toLowerCase() === 'true');

  const simplified = list.map(c => ({
    clinicCode: c.clinicCode,
    clinicName: c.clinicName,
    evidenceUrl: c.evidenceUrl,
    lastVerifiedAt: c.lastVerifiedAt,
    pricing: c.pricing,
    stores: c.stores
  }));

  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'available-clinics.json');
  fs.writeFileSync(outPath, JSON.stringify({ menuSlug, clinics: simplified }, null, 2), 'utf-8');
  console.log('✅ available-clinics.json を生成しました');
  console.log(`📍 保存先: ${outPath}`);
  console.log(`📊 クリニック数: ${simplified.length}`);
}

main();



