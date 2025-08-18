#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * CSVをパースする関数（csv-parseモジュール不要版）
 */
function parseCSV(content) {
    const lines = content.split('\n');
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const row = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        row.push(current); // 最後のフィールドを追加
        
        result.push(row);
    }
    
    return result;
}

/**
 * clinic-texts.csvをclinic-texts.jsonに変換するスクリプト
 */
function convertClinicTextsToJson() {
    // CSVファイルを読み込み
    const csvContent = fs.readFileSync(path.join(__dirname, 'clinic-texts.csv'), 'utf-8');
    
    // CSVをパース
    const records = parseCSV(csvContent);
    
    // 結果オブジェクトを初期化
    const result = {};
    
    // データ構造を準備
    const clinicsData = {};
    const comparisonHeaders = {};
    const detailFields = {};
    const metaFields = {};
    
    // ヘッダー行（クリニック名）を取得
    const headers = records[0];
    const clinicNames = headers.slice(2); // 最初の2列（list_name、項目名）を除く
    
    // クリニックデータを初期化
    clinicNames.forEach(clinic => {
        if (clinic && clinic.trim()) {
            clinicsData[clinic] = {};
        }
    });
    
    // 各行を処理
    for (let i = 1; i < records.length; i++) {
        const row = records[i];
        if (!row || row.length === 0) continue;
        
        const listName = row[0]; // list_name（comparison1, detail1, meta1など）
        const fieldName = row[1]; // 項目名（費用、目安期間など）
        
        if (!listName || !fieldName) continue;
        
        // list_nameに基づいて処理を分岐
        if (listName.startsWith('comparison')) {
            // 比較表項目
            const headerNum = listName.replace('comparison', '');
            comparisonHeaders[`比較表ヘッダー${headerNum}`] = fieldName;
            
            // 各クリニックのデータを格納
            for (let j = 0; j < clinicNames.length; j++) {
                const clinicName = clinicNames[j];
                if (clinicName && clinicName.trim() && clinicsData[clinicName]) {
                    const value = row[j + 2] || '';
                    clinicsData[clinicName][fieldName] = value;
                }
            }
        } else if (listName.startsWith('detail')) {
            // 詳細セクション項目
            const detailNum = listName.replace('detail', '');
            
            // 詳細フィールドのマッピングを作成
            let mappingKey = '';
            switch(fieldName) {
                case '費用':
                    mappingKey = 'priceDetail';
                    break;
                case '目安期間':
                    mappingKey = 'periods';
                    break;
                case '矯正範囲':
                    mappingKey = 'ranges';
                    break;
                case '営業時間':
                    mappingKey = 'hours';
                    break;
                case '店舗':
                    mappingKey = 'stores';
                    break;
                case '特徴タグ':
                    mappingKey = 'featureTags';
                    break;
                default:
                    mappingKey = fieldName;
            }
            
            if (mappingKey && mappingKey !== '特徴タグ') {
                // 特徴タグは価格表には含めない
                detailFields[mappingKey] = fieldName;
            }
            
            // 各クリニックのデータを格納（詳細用のフィールド名で保存）
            for (let j = 0; j < clinicNames.length; j++) {
                const clinicName = clinicNames[j];
                if (clinicName && clinicName.trim() && clinicsData[clinicName]) {
                    const value = row[j + 2] || '';
                    // 詳細項目は「詳細_」プレフィックスを付けて保存
                    clinicsData[clinicName][`詳細_${fieldName}`] = value;
                }
            }
        } else if (listName.startsWith('tags')) {
            // タグ項目（詳細セクション用）
            for (let j = 0; j < clinicNames.length; j++) {
                const clinicName = clinicNames[j];
                if (clinicName && clinicName.trim() && clinicsData[clinicName]) {
                    const value = row[j + 2] || '';
                    // タグは詳細_プレフィックス付きで保存
                    clinicsData[clinicName][`詳細_${fieldName}`] = value;
                }
            }
        } else if (listName.startsWith('meta')) {
            // メタ情報項目
            for (let j = 0; j < clinicNames.length; j++) {
                const clinicName = clinicNames[j];
                if (clinicName && clinicName.trim() && clinicsData[clinicName]) {
                    const value = row[j + 2] || '';
                    clinicsData[clinicName][fieldName] = value;
                }
            }
        } else {
            // その他の項目（デフォルト処理）
            for (let j = 0; j < clinicNames.length; j++) {
                const clinicName = clinicNames[j];
                if (clinicName && clinicName.trim() && clinicsData[clinicName]) {
                    const value = row[j + 2] || '';
                    clinicsData[clinicName][fieldName] = value;
                }
            }
        }
    }
    
    // 結果を組み立て
    result['比較表ヘッダー設定'] = comparisonHeaders;
    result['詳細フィールドマッピング'] = detailFields;
    
    // 公式サイトURLを詳細フィールドマッピングに追加
    detailFields['officialSite'] = '公式サイトURL';
    
    // クリニックデータを結果に追加
    Object.keys(clinicsData).forEach(clinic => {
        result[clinic] = clinicsData[clinic];
    });
    
    // JSONファイルとして保存
    const jsonPath = path.join(__dirname, 'clinic-texts.json');
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
    
    console.log('✅ clinic-texts.json を生成しました');
    console.log(`📍 保存先: ${jsonPath}`);
    
    // 比較表ヘッダー設定が含まれているか確認
    if (result['比較表ヘッダー設定']) {
        console.log('📋 比較表ヘッダー設定:', Object.keys(result['比較表ヘッダー設定']).length + '項目');
    }
    
    // 詳細フィールドマッピングが含まれているか確認
    if (result['詳細フィールドマッピング']) {
        console.log('📋 詳細フィールドマッピング:', Object.keys(result['詳細フィールドマッピング']).length + '項目');
    }
    
    // クリニック数を計算
    const clinicCount = clinicNames.filter(name => name && name.trim()).length;
    console.log(`📊 クリニック数: ${clinicCount}`);
    
    // 各クリニックの項目数を表示
    clinicNames.forEach(clinic => {
        if (clinic && clinic.trim() && result[clinic]) {
            try {
                const itemCount = Object.keys(result[clinic]).length;
                console.log(`   - ${clinic}: ${itemCount}項目`);
            } catch (e) {
                console.log(`   - ${clinic}: データ取得エラー`);
            }
        }
    });
}

// 実行
try {
    convertClinicTextsToJson();
} catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
}