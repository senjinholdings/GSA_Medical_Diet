#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const rows = [];
  let headers = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    let row = [];
    let cur = '';
    let inQ = false;
    for (let j = 0; j < raw.length; j++) {
      const ch = raw[j];
      if (ch === '"') inQ = !inQ; else if (ch === ',' && !inQ) { row.push(cur); cur = ''; } else { cur += ch; }
    }
    row.push(cur);
    if (i === 0) headers = row; else {
      const obj = {}; headers.forEach((h, idx) => obj[h] = (row[idx]||'').trim()); rows.push(obj);
    }
  }
  return rows;
}

function readCSV(filename) {
  const p = path.join(__dirname, filename);
  return parseCSV(fs.readFileSync(p, 'utf-8'));
}

function convert() {
  const clinics = readCSV('clinics.csv');
  const stores = readCSV('clinic-stores.csv');
  const menus = readCSV('menus.csv');
  const map = readCSV('clinic-menu-map.csv');
  const pricing = readCSV('clinic-menu-pricing.csv');

  // インデックス作成
  const clinicByCode = Object.fromEntries(clinics.map(c => [c.clinic_code, c]));
  const storesByClinic = stores.reduce((acc, s) => { (acc[s.clinic_code] ||= []).push(s); return acc; }, {});
  const pricingByKey = pricing.reduce((acc, p) => { acc[`${p.clinic_code}:${p.menu_slug}`] = p; return acc; }, {});

  // メニューごとのクリニックリスト
  const menuToClinics = {};
  map.forEach(m => {
    const key = m.menu_slug;
    const clinic = clinicByCode[m.clinic_code];
    if (!clinic) return;
    (menuToClinics[key] ||= []).push({
      clinicCode: m.clinic_code,
      clinicName: clinic.clinic_name,
      available: m.available || 'unknown',
      evidenceUrl: m.evidence_url || '',
      lastVerifiedAt: m.last_verified_at || '',
      pricing: pricingByKey[`${m.clinic_code}:${m.menu_slug}`] || null,
      stores: storesByClinic[m.clinic_code] || []
    });
  });

  const out = {
    menus,
    clinics,
    stores,
    clinicMenuMap: map,
    clinicMenuPricing: pricing,
    menuToClinics
  };

  const outPath = path.join(__dirname, 'global-data.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');
  console.log('✅ global-data.json を生成しました');
  console.log(`📍 保存先: ${outPath}`);
}

try { convert(); } catch (e) { console.error('❌ 変換エラー:', e.message); process.exit(1); }



