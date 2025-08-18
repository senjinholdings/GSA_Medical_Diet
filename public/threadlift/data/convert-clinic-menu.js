#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const result = [];
  let headers = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    let row = [];
    let cur = '';
    let inQ = false;
    for (let j = 0; j < raw.length; j++) {
      const ch = raw[j];
      if (ch === '"') {
        inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        row.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    row.push(cur);
    if (i === 0) {
      headers = row;
    } else {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = (row[idx] || '').trim();
      });
      result.push(obj);
    }
  }
  return result;
}

function convert() {
  const csvPath = path.join(__dirname, 'clinic-menu.csv');
  const jsonPath = path.join(__dirname, 'clinic-menu.json');
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csv);

  // 正規化：availableをboolean/enum化、store_idsは配列に
  const normalized = rows.map(r => ({
    clinicCode: r.clinic_code,
    clinicName: r.clinic_name,
    menuSlug: r.menu_slug,
    available: (r.available || 'unknown'),
    evidenceUrl: r.evidence_url || '',
    lastVerifiedAt: r.last_verified_at || '',
    storeIds: (r.store_ids || '').split('|').filter(Boolean),
    pricing: {
      minTaxIncluded: r.price_min_tax_included || '',
      maxTaxIncluded: r.price_max_tax_included || '',
      unit: r.price_unit || '',
      anesthesiaFeeIncluded: r.anesthesia_fee_included || '',
      additionalFeesNote: r.additional_fees_note || ''
    },
    threads: {
      threadTypes: (r.thread_types || '').split('|').filter(Boolean),
      materialTypes: (r.material_types || '').split('|').filter(Boolean),
      brandNames: (r.brand_names || '').split('|').filter(Boolean),
      countMin: r.threads_count_min || '',
      countMax: r.threads_count_max || ''
    },
    notes: {
      downtime: r.downtime_note || '',
      risks: r.risks_note || '',
      guaranteePolicy: r.guarantee_policy_note || ''
    },
    reservationUrl: r.reservation_url || ''
  }));

  fs.writeFileSync(jsonPath, JSON.stringify(normalized, null, 2), 'utf-8');
  console.log('✅ clinic-menu.json を生成しました');
  console.log(`📍 保存先: ${jsonPath}`);
  console.log(`📊 クリニック数: ${normalized.length}`);
}

try {
  convert();
} catch (e) {
  console.error('❌ 変換エラー:', e.message);
  process.exit(1);
}


