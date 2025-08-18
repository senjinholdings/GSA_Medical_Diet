// 手動テスト用のシンプルなHTML検証スクリプト
const fs = require('fs');
const path = require('path');

console.log('🧪 比較表タブ機能の手動テストを開始...');

// HTMLファイルの存在確認
const htmlPath = './public/mouthpiece002/index.html';
const jsPath = './public/mouthpiece002/app.js';

try {
    // HTMLファイルの読み込み
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // タブ要素の存在確認
    console.log('\n1. HTMLタブ要素の確認:');
    const hasTabMenu = htmlContent.includes('comparison-tab-menu');
    const hasTab1 = htmlContent.includes('data-tab="tab1"');
    const hasTab2 = htmlContent.includes('data-tab="tab2"'); 
    const hasTab3 = htmlContent.includes('data-tab="tab3"');
    
    console.log(`   ✅ タブメニュー要素: ${hasTabMenu ? '存在' : '❌ 不在'}`);
    console.log(`   ✅ 総合タブ: ${hasTab1 ? '存在' : '❌ 不在'}`);
    console.log(`   ✅ 施術内容タブ: ${hasTab2 ? '存在' : '❌ 不在'}`);
    console.log(`   ✅ サービスタブ: ${hasTab3 ? '存在' : '❌ 不在'}`);
    
    // JavaScriptファイルの読み込み
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    
    // JavaScript関数の存在確認
    console.log('\n2. JavaScript機能の確認:');
    const hasSetupFunction = jsContent.includes('setupComparisonTabs()');
    const hasUpdateColumnsFunction = jsContent.includes('updateTableColumns');
    const hasEventListener = jsContent.includes('addEventListener');
    const hasTabColumns = jsContent.includes('tabColumns');
    
    console.log(`   ✅ setupComparisonTabs関数: ${hasSetupFunction ? '存在' : '❌ 不在'}`);
    console.log(`   ✅ updateTableColumns関数: ${hasUpdateColumnsFunction ? '存在' : '❌ 不在'}`);
    console.log(`   ✅ イベントリスナー: ${hasEventListener ? '存在' : '❌ 不在'}`);
    console.log(`   ✅ タブ列設定: ${hasTabColumns ? '存在' : '❌ 不在'}`);
    
    // 列設定の詳細確認
    console.log('\n3. タブ列設定の詳細:');
    const tab1Match = jsContent.match(/'tab1':\s*\[(.*?)\]/);
    const tab2Match = jsContent.match(/'tab2':\s*\[(.*?)\]/);
    const tab3Match = jsContent.match(/'tab3':\s*\[(.*?)\]/);
    
    if (tab1Match) {
        console.log(`   ✅ 総合タブ列: [${tab1Match[1]}]`);
    }
    if (tab2Match) {
        console.log(`   ✅ 施術内容タブ列: [${tab2Match[1]}]`);
    }
    if (tab3Match) {
        console.log(`   ✅ サービスタブ列: [${tab3Match[1]}]`);
    }
    
    // ヘッダー順序の確認
    console.log('\n4. ヘッダー順序の確認:');
    const headerOrder = [
        'クリニック',
        '総合評価', 
        '費用',
        '特徴',
        '公式サイト',
        '矯正範囲',
        '目安期間',
        '通院頻度',
        '実績/症例数',
        'ワイヤー矯正の紹介',
        'サポート'
    ];
    
    headerOrder.forEach((header, index) => {
        const inHtml = htmlContent.includes(`<th>${header}</th>`) || 
                      htmlContent.includes(`>${header}</th>`) ||
                      htmlContent.includes(`default: '${header}'`);
        const inJs = jsContent.includes(`'${header}'`);
        console.log(`   ${index}: ${header} - HTML:${inHtml ? '✅' : '❌'} JS:${inJs ? '✅' : '❌'}`);
    });
    
    // 初期化処理の確認
    console.log('\n5. 初期化処理の確認:');
    const hasInitCall = jsContent.includes('this.setupComparisonTabs()');
    console.log(`   ✅ setupComparisonTabs呼び出し: ${hasInitCall ? '存在' : '❌ 不在'}`);
    
    // データファイルの確認
    console.log('\n6. データファイルの確認:');
    const dataPath = './public/mouthpiece002/data/clinic-texts.json';
    if (fs.existsSync(dataPath)) {
        const dataContent = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const hasOhMyTeeth = dataContent['Oh my teeth'];
        const hasKireiLine = dataContent['キレイライン矯正'];
        
        console.log(`   ✅ clinic-texts.json: 存在`);
        console.log(`   ✅ Oh my teethデータ: ${hasOhMyTeeth ? '存在' : '❌ 不在'}`);
        console.log(`   ✅ キレイライン矯正データ: ${hasKireiLine ? '存在' : '❌ 不在'}`);
        
        if (hasOhMyTeeth) {
            console.log(`   ℹ️  Oh my teethクリニック名: "${dataContent['Oh my teeth']['クリニック名']}"`);
            console.log(`   ℹ️  Oh my teeth総合評価: "${dataContent['Oh my teeth']['総合評価']}"`);
        }
        if (hasKireiLine) {
            console.log(`   ℹ️  キレイラインクリニック名: "${dataContent['キレイライン矯正']['クリニック名']}"`);
            console.log(`   ℹ️  キレイライン総合評価: "${dataContent['キレイライン矯正']['総合評価']}"`);
        }
    } else {
        console.log(`   ❌ clinic-texts.json: 不在`);
    }
    
    // 総合判定
    console.log('\n🏁 テスト結果サマリー:');
    const allChecks = [
        hasTabMenu, hasTab1, hasTab2, hasTab3,
        hasSetupFunction, hasUpdateColumnsFunction, hasEventListener, hasTabColumns,
        hasInitCall
    ];
    
    const passedChecks = allChecks.filter(check => check).length;
    const totalChecks = allChecks.length;
    
    console.log(`   ✅ ${passedChecks}/${totalChecks} のチェックが合格`);
    
    if (passedChecks === totalChecks) {
        console.log('   🎉 全ての基本的な実装が完了しています！');
        console.log('   📋 ブラウザでの動作確認を推奨します:');
        console.log('   📋 http://localhost:3000/ を開いて以下をテスト:');
        console.log('     - 総合タブクリック → 5列表示（クリニック、総合評価、費用、特徴、公式サイト）');
        console.log('     - 施術内容タブクリック → 5列表示（クリニック、矯正範囲、目安期間、通院頻度、公式サイト）');
        console.log('     - サービスタブクリック → 5列表示（クリニック、実績/症例数、ワイヤー矯正の紹介、サポート、公式サイト）');
    } else {
        console.log('   ⚠️  いくつかの実装が不完全です。上記の詳細を確認してください。');
    }
    
} catch (error) {
    console.error('❌ テスト実行中にエラーが発生:', error.message);
}