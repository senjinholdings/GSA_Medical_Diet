// ブラウザ内で実行するためのテストスクリプト
// Chromeの開発者ツールのコンソールで実行

console.log('🧪 ブラウザ内比較表タブ機能テスト開始...');

// 1. タブ要素の存在確認
const tabItems = document.querySelectorAll('.comparison-tab-menu-item');
console.log(`✅ タブ要素数: ${tabItems.length}個`);

// 2. 比較表の存在確認
const comparisonTable = document.getElementById('comparison-table');
console.log(`✅ 比較表: ${comparisonTable ? '存在' : '❌ 不在'}`);

// 3. 初期状態の確認
const activeTab = document.querySelector('.comparison-tab-menu-item.tab-active');
console.log(`✅ 初期アクティブタブ: ${activeTab ? activeTab.textContent : '❌ 不在'}`);

// 4. 初期表示列数の確認
const visibleHeaders = Array.from(comparisonTable.querySelectorAll('thead th:not([style*="display: none"])'));
const visibleCells = Array.from(comparisonTable.querySelectorAll('tbody tr:first-child td:not([style*="display: none"])'));

console.log(`✅ 初期表示ヘッダー数: ${visibleHeaders.length}個`);
console.log(`✅ 初期表示セル数: ${visibleCells.length}個`);
console.log(`✅ 表示中のヘッダー: ${visibleHeaders.map(h => h.textContent).join(', ')}`);

// 5. タブクリック動作テスト
function testTabClick(tabSelector, expectedTabName, expectedColumns) {
    return new Promise((resolve) => {
        const tab = document.querySelector(tabSelector);
        if (!tab) {
            console.log(`❌ ${tabSelector} が見つかりません`);
            return resolve(false);
        }
        
        tab.click();
        
        setTimeout(() => {
            const newActiveTab = document.querySelector('.comparison-tab-menu-item.tab-active');
            const newVisibleHeaders = Array.from(comparisonTable.querySelectorAll('thead th:not([style*="display: none"])'));
            const newVisibleCells = Array.from(comparisonTable.querySelectorAll('tbody tr:first-child td:not([style*="display: none"])'));
            
            const success = newActiveTab && 
                           newActiveTab.textContent.includes(expectedTabName) && 
                           newVisibleHeaders.length === expectedColumns &&
                           newVisibleCells.length === expectedColumns;
                           
            console.log(`${success ? '✅' : '❌'} ${expectedTabName}タブテスト:`);
            console.log(`   アクティブ: ${newActiveTab ? newActiveTab.textContent : '❌'}`);
            console.log(`   表示列数: ${newVisibleHeaders.length}/${expectedColumns}`);
            console.log(`   ヘッダー: ${newVisibleHeaders.map(h => h.textContent).join(', ')}`);
            
            resolve(success);
        }, 300);
    });
}

// 6. 連続テスト実行
async function runAllTests() {
    console.log('\n🔄 タブクリックテスト開始...');
    
    const tests = [
        { selector: '[data-tab="tab1"]', name: '総合', columns: 5 },
        { selector: '[data-tab="tab2"]', name: '施術内容', columns: 5 },
        { selector: '[data-tab="tab3"]', name: 'サービス', columns: 5 },
        { selector: '[data-tab="tab1"]', name: '総合', columns: 5 } // 戻りテスト
    ];
    
    const results = [];
    for (const test of tests) {
        const result = await testTabClick(test.selector, test.name, test.columns);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 7. 公式サイトボタンの確認
    console.log('\n🔍 公式サイトボタンチェック...');
    const officialSiteButtons = document.querySelectorAll('#comparison-table tbody tr td:not([style*="display: none"]) a');
    const officialSiteCount = Array.from(officialSiteButtons).filter(btn => btn.textContent.includes('公式サイト')).length;
    console.log(`✅ 公式サイトボタン数: ${officialSiteCount}個`);
    
    // 8. クリニック名とデータの整合性チェック
    console.log('\n🔍 データ整合性チェック...');
    const firstRow = comparisonTable.querySelector('tbody tr:first-child');
    const clinicName = firstRow.querySelector('td:first-child a').textContent;
    const clinicLogo = firstRow.querySelector('td:first-child img').alt;
    const rating = firstRow.querySelector('td:nth-child(2) .ranking_evaluation');
    
    console.log(`✅ 1位クリニック名: ${clinicName}`);
    console.log(`✅ 1位ロゴalt: ${clinicLogo}`);
    console.log(`✅ 1位評価: ${rating ? rating.textContent : '❌ 不在'}`);
    console.log(`✅ 名前とロゴ一致: ${clinicName === clinicLogo ? '✅' : '❌'}`);
    
    // 9. 総合結果
    const passedTests = results.filter(r => r).length;
    console.log(`\n🏁 テスト完了: ${passedTests}/${results.length} 合格`);
    
    if (passedTests === results.length && officialSiteCount > 0) {
        console.log('🎉 全てのテストが合格しました！タブ機能は正常に動作しています。');
    } else {
        console.log('⚠️ 一部のテストが失敗しました。詳細を確認してください。');
    }
    
    return {
        tabTests: results,
        officialSiteCount,
        dataConsistency: clinicName === clinicLogo
    };
}

// 実行
runAllTests().then(result => {
    console.log('📊 最終テスト結果:', result);
});