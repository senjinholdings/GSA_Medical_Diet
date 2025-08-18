#!/usr/bin/env node

// Generate Google Places query CSV from existing stores.csv
// Usage:
//   node public/tools/make-stores-queries.js \
//     "/abs/path/to/出しわけSS - stores.csv" ["/abs/path/to/stores-to-resolve.csv"]
// Input headers: store_id,clinic_name,store_name,Zipcode,adress,access
// Output headers: store_id,clinic_name,store_name,query

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
  const [, , inPathArg, outPathArg] = process.argv;
  if (!inPathArg) {
    console.error('Usage: node public/tools/make-stores-queries.js "/abs/path/to/出しわけSS - stores.csv" ["/abs/path/to/stores-to-resolve.csv"]');
    process.exit(1);
  }
  const inPath = path.isAbsolute(inPathArg) ? inPathArg : path.join(process.cwd(), inPathArg);
  const raw = fs.readFileSync(inPath, 'utf-8');
  const rows = parseCSV(raw);
  if (rows.length === 0) process.exit(0);
  const header = rows[0];
  const h = Object.fromEntries(header.map((k, i) => [k, i]));
  const needed = ['store_id','clinic_name','store_name','Zipcode','adress','access'];
  for (const k of needed) if (!(k in h)) { console.error('入力ヘッダーが不足: ' + k); process.exit(1); }

  const out = [['store_id','clinic_name','store_name','query']];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]; if (!r || r.length === 0) continue;
    const zipcode = r[h.Zipcode] || '';
    const address = r[h.adress] || '';
    // 対象は「（要確認）」や空欄の行
    const needs = address.includes('要確認') || address.trim() === '' || zipcode.includes('要確認') || zipcode.trim() === '';
    if (!needs) continue;
    const storeId = r[h.store_id];
    const clinicName = r[h.clinic_name];
    const storeName = r[h.store_name];
    if (!storeId || !storeName) continue;
    const query = `${storeName} ${clinicName}`.trim();
    out.push([storeId, clinicName, storeName, query]);
  }

  const outPath = outPathArg ? (path.isAbsolute(outPathArg) ? outPathArg : path.join(process.cwd(), outPathArg))
                              : path.join(path.dirname(inPath), 'stores-to-resolve.csv');
  fs.writeFileSync(outPath, toCSV(out), 'utf-8');
  console.log('✅ クエリCSVを出力しました: ' + outPath);
  console.log('📊 対象件数: ' + (out.length - 1));
}

main();


