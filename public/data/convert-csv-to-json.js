const fs = require('fs');
const path = require('path');

// CSVパーサー
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        data.push(obj);
    }

    return data;
}

// 対応部位の文字列をパーツ配列に変換する関数
function parseBodyParts(bodyPartsText) {
    if (!bodyPartsText) return ['stomach', 'thigh']; // デフォルト
    
    const parts = [];
    if (bodyPartsText.includes('顔') || bodyPartsText.includes('face')) parts.push('face');
    if (bodyPartsText.includes('二の腕') || bodyPartsText.includes('upperarm')) parts.push('upperarm');
    if (bodyPartsText.includes('お腹') || bodyPartsText.includes('腹') || bodyPartsText.includes('stomach')) parts.push('stomach');
    if (bodyPartsText.includes('お尻') || bodyPartsText.includes('buttocks')) parts.push('buttocks');
    if (bodyPartsText.includes('太もも') || bodyPartsText.includes('thigh')) parts.push('thigh');
    if (bodyPartsText.includes('その他') || bodyPartsText.includes('全身') || bodyPartsText.includes('other')) parts.push('other');
    
    return parts.length > 0 ? parts : ['stomach', 'thigh'];
}

// メイン処理
async function convertCSVtoJSON() {
    console.log('📍 CSV → JSON変換開始...\n');
    console.log('🔄 v3.0 - 完全動的対応版: CSVデータから全て自動取得、ハードコード撤廃');

    // 現在のディレクトリ（dataディレクトリ）を使用
    const dataDir = __dirname;
    
    // 1. 地域データ
    console.log('1️⃣ 地域データを読み込み中...');
    const regionCSV = fs.readFileSync(path.join(dataDir, '出しわけSS - region.csv'), 'utf8');
    const regions = parseCSV(regionCSV).map(row => ({
        id: row.parameter_no,
        name: row.region
    }));
    console.log(`   ✅ ${regions.length}件の地域データ`);

    // 2. クリニックデータ
    console.log('\n2️⃣ クリニックデータを読み込み中...');
    const clinicCSV = fs.readFileSync(path.join(dataDir, '出しわけSS - items.csv'), 'utf8');
    const clinics = parseCSV(clinicCSV);
    console.log(`   ✅ ${clinics.length}件のクリニックデータ`);

    // 3. 店舗データ
    console.log('\n3️⃣ 店舗データを読み込み中...');
    const storeCSV = fs.readFileSync(path.join(dataDir, '出しわけSS - stores.csv'), 'utf8');
    const stores = parseCSV(storeCSV);
    console.log(`   ✅ ${stores.length}件の店舗データ`);

    // 4. ランキングデータ
    console.log('\n4️⃣ ランキングデータを読み込み中...');
    const rankingCSV = fs.readFileSync(path.join(dataDir, '出しわけSS - ranking.csv'), 'utf8');
    const rankings = parseCSV(rankingCSV);
    console.log(`   ✅ ${rankings.length}件のランキングデータ`);

    // 5. 店舗ビューデータ
    console.log('\n5️⃣ 店舗ビューデータを読み込み中...');
    const storeViewCSV = fs.readFileSync(path.join(dataDir, '出しわけSS - store_view.csv'), 'utf8');
    const storeViews = parseCSV(storeViewCSV);
    console.log(`   ✅ ${storeViews.length}件の店舗ビューデータ`);

    // 6. キャンペーンデータ
    console.log('\n6️⃣ キャンペーンデータを読み込み中...');
    const campaignCSV = fs.readFileSync(path.join(dataDir, '出しわけSS - campaigns.csv'), 'utf8');
    const campaigns = parseCSV(campaignCSV);
    console.log(`   ✅ ${campaigns.length}件のキャンペーンデータ`);

    // 7. クリニック詳細情報（injection-lipolysis001から）
    console.log('\n7️⃣ クリニック詳細情報を読み込み中...');
    let clinicTexts = {};
    try {
        const clinicTextsPath = path.join(__dirname, '../injection-lipolysis001/data/clinic-texts.json');
        if (fs.existsSync(clinicTextsPath)) {
            const clinicTextsJSON = fs.readFileSync(clinicTextsPath, 'utf8');
            clinicTexts = JSON.parse(clinicTextsJSON);
            console.log(`   ✅ ${Object.keys(clinicTexts).length}件のクリニック詳細情報`);
        } else {
            console.log('   ⚠️  クリニック詳細情報が見つかりません、基本情報のみ使用');
        }
    } catch (error) {
        console.log('   ⚠️  クリニック詳細情報の読み込みに失敗、基本情報のみ使用');
    }

    // データを統合して構造化
    console.log('\n📊 データを統合中...');
    
    // クリニック名とコードのマッピング（完全動的）
    const clinicCodeMap = {};
    const clinicNameMap = {};
    clinics.forEach(clinic => {
        clinicCodeMap[clinic.clinic_name] = clinic.code;
        clinicNameMap[clinic.code] = clinic.clinic_name;
    });
    
    // クリニックごとにデータを集約
    const compiledClinics = clinics.map(clinic => {
        const clinicName = clinic.clinic_name;
        const clinicCode = clinic.code;
        
        // 該当クリニックの全店舗を取得（複数パターンで検索）
        const clinicStores = stores.filter(store => {
            return store.clinic_name === clinicName || 
                   store.clinic_name === clinicCode.toUpperCase() || 
                   store.clinic_name === 'DIO' && clinicCode === 'dio' ||
                   store.clinic_name === 'DSクリニック' && clinicCode === 'ds';
        });
        
        // 店舗が存在する地域IDを取得
        const clinicRegions = new Set();
        clinicStores.forEach(store => {
            // 住所から地域を判断
            regions.forEach(region => {
                if (store.adress && store.adress.includes(region.name)) {
                    clinicRegions.add(region.id);
                }
            });
        });
        
        // クリニック詳細情報から対応部位と特徴を取得
        const clinicDetail = clinicTexts[clinicCode];
        let bodyParts = ['stomach', 'thigh']; // デフォルト
        let features = '医療ダイエット専門クリニック'; // デフォルト
        
        if (clinicDetail) {
            // 対応部位を解析
            bodyParts = parseBodyParts(clinicDetail['対応部位']);
            
            // 特徴を取得（複数の候補から）
            features = clinicDetail['特徴タグ'] || 
                      clinicDetail['ランキングプッシュメッセージ'] || 
                      clinicDetail['詳細タイトル'] || 
                      features;
            
            // HTMLタグを削除
            features = features.replace(/<[^>]*>/g, '').replace(/# /g, '').split('<br>')[0];
        }
        
        return {
            id: clinic.clinic_id,
            code: clinicCode,
            name: clinicName,
            regions: Array.from(clinicRegions).sort(),
            storeCount: clinicStores.length,
            bodyParts: bodyParts,
            features: features,
            stores: clinicStores.map(store => ({
                id: store.store_id,
                name: store.store_name,
                address: store.adress,
                zipcode: store.Zipcode,
                access: store.access
            }))
        };
    });

    // ランキングデータを地域ごとに整理
    const rankingsByRegion = {};
    rankings.forEach(ranking => {
        const regionId = ranking.parameter_no;
        rankingsByRegion[regionId] = {
            no1: ranking.no1,
            no2: ranking.no2,
            no3: ranking.no3,
            no4: ranking.no4,
            no5: ranking.no5
        };
    });

    // 店舗ビューデータを地域ごとに整理（新しいヘッダー構造に対応）
    const storeViewsByRegion = {};
    storeViews.forEach(view => {
        const regionId = view.parameter_no;
        const regionData = {};
        
        // 新しいヘッダー構造に対応（dio_stores, eminal_stores, sbc_stores等）
        Object.keys(view).forEach(key => {
            // parameter_no以外のすべての_storesフィールドを処理
            if (key !== 'parameter_no' && key.endsWith('_stores')) {
                regionData[key] = view[key] && view[key] !== '-' ? view[key].split('/') : [];
            }
        });
        
        storeViewsByRegion[regionId] = regionData;
    });

    // 統合データ
    const compiledData = {
        regions: regions,
        clinics: compiledClinics,
        rankings: rankingsByRegion,
        storeViews: storeViewsByRegion,
        campaigns: campaigns.map(campaign => ({
            id: campaign.campaign_id,
            regionId: campaign.region_id,
            clinicId: campaign.clinic_id,
            title: campaign.title,
            headerText: campaign.header_text,
            logoSrc: campaign.logo_src,
            logoAlt: campaign.logo_alt,
            description: campaign.description,
            ctaText: campaign.cta_text,
            ctaUrl: campaign.cta_url,
            footerText: campaign.footer_text
        })),
        metadata: {
            lastUpdated: new Date().toISOString(),
            totalClinics: clinics.length,
            totalStores: stores.length,
            totalRegions: regions.length
        }
    };

    // JSONファイルとして保存
    const outputPath = path.join(dataDir, 'compiled-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(compiledData, null, 2), 'utf8');
    
    console.log('\n✅ 変換完了！');
    console.log(`📁 出力先: ${outputPath}`);
    console.log(`📊 ファイルサイズ: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
    // 統計情報
    console.log('\n📈 統計情報:');
    compiledClinics.forEach(clinic => {
        console.log(`   ${clinic.name}: ${clinic.storeCount}店舗, ${clinic.regions.length}地域`);
    });
    
    console.log('\n💡 ヒント: 他の環境にも反映する場合は以下のコマンドを実行してください:');
    console.log('   cp compiled-data.json ../draft/data/');
    console.log('   cp compiled-data.json ../medical-diet001/data/');
    console.log('   cp compiled-data.json ../medical-diet002/data/');
}

// 実行
convertCSVtoJSON().catch(console.error);