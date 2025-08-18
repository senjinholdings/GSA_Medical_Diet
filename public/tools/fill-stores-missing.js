#!/usr/bin/env node

// Usage: node public/tools/fill-stores-missing.js \
//          "/absolute/path/to/出しわけSS - stores.csv" [--in-place]
// Default outputs a new file with .filled.csv suffix unless --in-place is specified

const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  // very simple CSV parser for this dataset (no quoted commas in current files)
  return text.replace(/\r\n/g, '\n').split('\n').map(l => l.split(','));
}

function toCSV(rows) {
  return rows.map(cols => cols.map(v => (v ?? '').includes(',') ? `"${v}"` : (v ?? '')).join(',')).join('\n');
}

function fillMissing(filePath, inPlace) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(raw);
  if (rows.length === 0) return;
  const header = rows[0];
  const colZip = header.indexOf('Zipcode');
  const colAddr = header.indexOf('adress'); // header is intentionally 'adress' in the source file
  const colAccess = header.indexOf('access');
  if (colZip === -1 || colAddr === -1 || colAccess === -1) {
    console.error('必要ヘッダー(Zipcode, adress, access)が見つかりませんでした');
    process.exit(1);
  }

  const PLACEHOLDER = '（要確認）';

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r.length) continue;
    if (!r[colZip] || r[colZip].trim() === '') r[colZip] = PLACEHOLDER;
    if (!r[colAddr] || r[colAddr].trim() === '') r[colAddr] = PLACEHOLDER;
    if (!r[colAccess] || r[colAccess].trim() === '' || r[colAccess].trim() === '-') r[colAccess] = PLACEHOLDER;
  }

  const outCsv = toCSV(rows);
  if (inPlace) {
    const backup = filePath.replace(/\.csv$/i, '.bak.csv');
    fs.writeFileSync(backup, raw, 'utf-8');
    fs.writeFileSync(filePath, outCsv, 'utf-8');
    console.log('✅ 追記完了（上書き保存）');
    console.log('📦 バックアップ: ' + backup);
  } else {
    const outPath = filePath.replace(/\.csv$/i, '.filled.csv');
    fs.writeFileSync(outPath, outCsv, 'utf-8');
    console.log('✅ 追記完了');
    console.log('📍 出力: ' + outPath);
  }
}

function main() {
  const [, , target, flag] = process.argv;
  if (!target) {
    console.log('Usage: node public/tools/fill-stores-missing.js "/abs/path/to/出しわけSS - stores.csv" [--in-place]');
    process.exit(1);
  }
  const abs = path.isAbsolute(target) ? target : path.join(process.cwd(), target);
  fillMissing(abs, flag === '--in-place');
}

main();


