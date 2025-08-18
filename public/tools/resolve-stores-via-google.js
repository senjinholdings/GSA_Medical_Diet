#!/usr/bin/env node

// Resolve store Zipcode/address via Google Places API
// Usage:
//   GOOGLE_MAPS_API_KEY=xxxx node public/tools/resolve-stores-via-google.js \
//     --input "/abs/path/to/stores-to-resolve.csv" \
//     --output "/abs/path/to/stores.resolved.csv" \
//     [--rate 250] [--country JP]
//
// Input CSV headers (required): store_id,clinic_name,store_name,query
// Output CSV headers: store_id,clinic_name,store_name,zipcode,address,access,place_id,source

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('GOOGLE_MAPS_API_KEY が未設定です');
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseCSV(text) {
  return text.replace(/\r\n/g, '\n').split('\n').filter(Boolean).map(l => l.split(','));
}

function toCSV(rows) {
  return rows.map(cols => cols.map(v => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',')).join('\n');
}

function getArg(name, def) {
  const idx = process.argv.indexOf(name);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return def;
}

async function findPlace(query, country = 'JP') {
  const fields = 'place_id,formatted_address,name';
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=${encodeURIComponent(fields)}&locationbias=ipbias&key=${API_KEY}&region=jp`; 
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' || !data.candidates || data.candidates.length === 0) return null;
  return data.candidates[0];
}

async function getDetails(placeId) {
  const fields = 'formatted_address,address_components,geometry,opening_hours,formatted_phone_number,url,name';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fields)}&language=ja&region=jp&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' || !data.result) return null;
  return data.result;
}

function extractZipAndAddress(formattedAddress, components) {
  // formattedAddress ex: "日本、〒150-0001 東京都渋谷区神宮前1-2-3 ○○ビル 2F"
  let zipcode = '';
  let address = '';
  const m = formattedAddress.match(/〒\s?(\d{3}-\d{4})\s*(.*)$/);
  if (m) {
    zipcode = m[1];
    address = m[2];
  } else {
    address = formattedAddress.replace(/^日本、?\s*/, '');
  }
  if (!zipcode && Array.isArray(components)) {
    const pc = components.find(c => c.types.includes('postal_code'));
    if (pc) zipcode = pc.long_name;
  }
  return { zipcode, address };
}

async function main() {
  const input = getArg('--input');
  const output = getArg('--output');
  const rate = parseInt(getArg('--rate', '250'), 10); // ms between calls
  const country = getArg('--country', 'JP');
  if (!input || !output) {
    console.error('Usage: GOOGLE_MAPS_API_KEY=xxxx node resolve-stores-via-google.js --input in.csv --output out.csv');
    process.exit(1);
  }

  const raw = fs.readFileSync(input, 'utf-8');
  const rows = parseCSV(raw);
  const header = rows[0];
  const h = Object.fromEntries(header.map((k, i) => [k, i]));
  for (const req of ['store_id', 'clinic_name', 'store_name', 'query']) {
    if (!(req in h)) {
      console.error('入力CSVに必要ヘッダーが不足: ' + req);
      process.exit(1);
    }
  }

  const outRows = [['store_id','clinic_name','store_name','zipcode','address','access','place_id','source']];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const storeId = r[h.store_id];
    const clinicName = r[h.clinic_name];
    const storeName = r[h.store_name];
    const query = (r[h.query] || `${storeName} ${clinicName}`).trim();
    if (!query) continue;

    try {
      const found = await findPlace(query, country);
      if (!found) {
        outRows.push([storeId, clinicName, storeName, '', '', '', '', 'not_found']);
      } else {
        await sleep(rate);
        const details = await getDetails(found.place_id);
        const formatted = details?.formatted_address || found.formatted_address || '';
        const { zipcode, address } = extractZipAndAddress(formatted, details?.address_components || []);
        outRows.push([storeId, clinicName, storeName, zipcode, address, '', found.place_id, 'google_places']);
      }
    } catch (e) {
      outRows.push([storeId, clinicName, storeName, '', '', '', '', 'error']);
    }
    await sleep(rate);
  }

  fs.writeFileSync(output, toCSV(outRows), 'utf-8');
  console.log('✅ 解決結果を書き出しました: ' + output);
}

main();


