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
    
    // 最初の行が比較表ヘッダー設定かチェック
    let startRow = 0;
    const result = {};
    
    // 比較表のヘッダー項目を収集するための配列
    const comparisonTableItems = [
        'クリニック名',
        '総合評価',
        '実績'
    ];
    
    if (records[0] && records[0][0] === '比較表ヘッダー設定') {
        // 比較表ヘッダー設定行はスキップ
        startRow = 1; // 次の行から処理開始
    }
    
    // ヘッダー行（クリニック名）を取得
    if (!records[startRow]) {
        console.error('❌ ヘッダー行が見つかりません');
        return;
    }
    
    const headers = records[startRow];
    const clinicNames = headers.slice(2); // 最初の2列（項目、目的・注意事項）を除く
    
    // クリニックデータを初期化
    clinicNames.forEach(clinic => {
        if (clinic && clinic.trim()) { // 空のクリニック名を除外
            result[clinic] = {};
        }
    });
    
    // 比較表で使用する項目のマッピング（順番を保持）
    const headerConfig = {};
    // 詳細セクションの項目マッピング
    const detailFieldMapping = {};
    
    // 各行を処理
    for (let i = startRow + 1; i < records.length; i++) {
        const row = records[i];
        if (!row || row.length === 0) continue; // 空行をスキップ
        
        const itemKey = row[0]; // 項目名（キーとして使用）
        const description = row[1]; // 説明文
        if (!itemKey || !itemKey.trim()) continue; // 空の項目名をスキップ
        
        // 比較表で使用される特定の項目を説明文で検出してマッピング
        if (itemKey === 'クリニック名' && description && description.includes('正式名称')) {
            headerConfig['比較表ヘッダー1'] = 'クリニック';
        } else if (description && description.includes('比較表の総合評価')) {
            headerConfig['比較表ヘッダー2'] = itemKey;
        } else if (description && description.includes('比較表の実績')) {
            headerConfig['比較表ヘッダー3'] = itemKey;
        } else if (description && description.includes('比較表の特徴')) {
            headerConfig['比較表ヘッダー4'] = itemKey;
        } else if (description && description.includes('比較表の金額') || description && description.includes('比較表の費用')) {
            headerConfig['比較表ヘッダー5'] = itemKey;
        } else if (description && description.includes('比較表の人気プラン')) {
            headerConfig['比較表ヘッダー6'] = itemKey;
        } else if (description && description.includes('比較表の医療機器')) {
            headerConfig['比較表ヘッダー6'] = itemKey;
        } else if (description && description.includes('比較表の注射治療')) {
            headerConfig['比較表ヘッダー7'] = itemKey;
        } else if (description && description.includes('比較表の対応部位')) {
            headerConfig['比較表ヘッダー8'] = itemKey;
        } else if (description && description.includes('比較表のモニター')) {
            headerConfig['比較表ヘッダー9'] = itemKey;
        } else if (description && description.includes('比較表の返金保証')) {
            headerConfig['比較表ヘッダー10'] = itemKey;
        } else if (description && description.includes('比較表の対応範囲')) {
            if (itemKey === '矯正範囲') {
                headerConfig['比較表ヘッダー8'] = itemKey;
            } else if (itemKey === '通院頻度') {
                headerConfig['比較表ヘッダー11'] = itemKey;
            }
        } else if (description && description.includes('比較表の目安期間')) {
            headerConfig['比較表ヘッダー9'] = itemKey;
        } else if (description && description.includes('比較表のワイヤー矯正')) {
            headerConfig['比較表ヘッダー12'] = itemKey;
        } else if (description && description.includes('比較表のサポート')) {
            headerConfig['比較表ヘッダー13'] = itemKey;
        }
        
        // 詳細セクションの項目を説明文で検出してマッピング
        // マッピングフォーマット: 内部キー（固定） → 実際のCSVキー（変更可能）
        if (description && description.includes('目安期間')) {
            detailFieldMapping['目安期間'] = itemKey;
        }
        if (description && description.includes('案件詳細セクションの対応部位')) {
            detailFieldMapping['対応部位'] = itemKey;
        }
        
        // 各クリニックのデータを格納
        for (let j = 0; j < clinicNames.length; j++) {
            const clinicName = clinicNames[j];
            if (clinicName && clinicName.trim() && result[clinicName]) { // 空のクリニック名を除外
                const value = row[j + 2] || ''; // 値が無い場合は空文字
                result[clinicName][itemKey] = value;
            }
        }
    }
    
    // 公式サイトは固定で追加
    headerConfig['比較表ヘッダー14'] = '公式サイト';
    
    // 比較表ヘッダー設定を追加
    if (Object.keys(headerConfig).length > 0) {
        result['比較表ヘッダー設定'] = headerConfig;
    }
    
    // 詳細フィールドマッピングを追加
    if (Object.keys(detailFieldMapping).length > 0) {
        result['詳細フィールドマッピング'] = detailFieldMapping;
    }
    
    // JSONファイルとして保存
    const jsonPath = path.join(__dirname, 'clinic-texts.json');
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
    
    console.log('✅ clinic-texts.json を生成しました');
    console.log(`📍 保存先: ${jsonPath}`);
    
    // 比較表ヘッダー設定が含まれているか確認
    if (result['比較表ヘッダー設定']) {
        console.log('📋 比較表ヘッダー設定: 検出されました');
    }
    
    // クリニック数を計算（比較表ヘッダー設定を除く）
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