#!/usr/bin/env node

// Merge resolved zipcode/address into existing stores.csv
// Usage:
//   node public/tools/merge-stores-from-resolved.js \
//     "/abs/path/to/出しわけSS - stores.csv" \
//     "/abs/path/to/stores.resolved.csv" \
//     [--in-place]
//
// Input A headers: store_id,clinic_name,store_name,Zipcode,adress,access
// Input B headers: store_id,clinic_name,store_name,zipcode,address,access,place_id,source

const fs = require('fs');
const path = require('path');

function parseCSV(text) { return text.replace(/\r\n/g, '\n').split('\n').map(l => l.split(',')); }
function toCSV(rows) {
  return rows.map(cols => cols.map(v => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',')).join('\n');
}

function main() {
  const [, , storesPathArg, resolvedPathArg, flag] = process.argv;
  if (!storesPathArg || !resolvedPathArg) {
    console.error('Usage: node public/tools/merge-stores-from-resolved.js "stores.csv" "stores.resolved.csv" [--in-place]');
    process.exit(1);
  }
  const storesPath = path.isAbsolute(storesPathArg) ? storesPathArg : path.join(process.cwd(), storesPathArg);
  const resolvedPath = path.isAbsolute(resolvedPathArg) ? resolvedPathArg : path.join(process.cwd(), resolvedPathArg);

  const storesRaw = fs.readFileSync(storesPath, 'utf-8');
  const resolvedRaw = fs.readFileSync(resolvedPath, 'utf-8');
  const storesRows = parseCSV(storesRaw);
  const resolvedRows = parseCSV(resolvedRaw);
  const hA = Object.fromEntries(storesRows[0].map((k, i) => [k, i]));
  const hB = Object.fromEntries(resolvedRows[0].map((k, i) => [k, i]));
  const map = new Map();
  for (let i = 1; i < resolvedRows.length; i++) {
    const r = resolvedRows[i]; if (!r || r.length === 0) continue;
    const id = r[hB.store_id]; if (!id) continue;
    map.set(id, r);
  }

  let updated = 0;
  for (let i = 1; i < storesRows.length; i++) {
    const r = storesRows[i]; if (!r || r.length === 0) continue;
    const id = r[hA.store_id]; if (!id) continue;
    const m = map.get(id);
    if (!m) continue;
    const newZip = (m[hB.zipcode] || '').trim();
    const newAddr = (m[hB.address] || '').trim();
    const newAccess = (m[hB.access] || '').trim();
    if (newZip) r[hA.Zipcode] = newZip;
    if (newAddr) r[hA.adress] = newAddr; // source header is 'adress'
    if (newAccess) r[hA.access] = newAccess;
    if (newZip || newAddr || newAccess) updated++;
  }

  const outCsv = toCSV(storesRows);
  if (flag === '--in-place') {
    const backup = storesPath.replace(/\.csv$/i, '.pre-merge.bak.csv');
    fs.writeFileSync(backup, storesRaw, 'utf-8');
    fs.writeFileSync(storesPath, outCsv, 'utf-8');
    console.log(`✅ マージ完了（上書き）。更新行: ${updated}`);
    console.log('📦 バックアップ: ' + backup);
  } else {
    const outPath = storesPath.replace(/\.csv$/i, '.merged.csv');
    fs.writeFileSync(outPath, outCsv, 'utf-8');
    console.log(`✅ マージ完了。更新行: ${updated}`);
    console.log('📍 出力: ' + outPath);
  }
}

main();


