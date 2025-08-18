const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    const page = await browser.newPage();

    // エラーとwarningを監視
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        
        if (type === 'error' && !text.includes('404')) {
            errors.push(text);
            console.log(`❌ ERROR: ${text}`);
        } else if (type === 'warning') {
            if (text.includes('kireiline_stores') || text.includes('Clinic not found')) {
                warnings.push(text);
                console.log(`⚠️ WARNING: ${text}`);
            }
        }
    });

    // JavaScriptエラーを監視
    page.on('pageerror', error => {
        errors.push(error.message);
        console.log(`❌ JS ERROR: ${error.message}`);
    });

    try {
        console.log('\n=== エラー修正確認テスト ===\n');
        console.log('1. ページにアクセス (region_id=013)...');
        await page.goto('http://localhost:3000/mouthpiece/?region_id=013');
        await page.waitForTimeout(3000);

        console.log('\n2. エラー/警告の収集結果:');
        console.log(`   - エラー数: ${errors.length}`);
        console.log(`   - 警告数: ${warnings.length}`);
        
        if (errors.length > 0) {
            console.log('\n❌ 検出されたエラー:');
            errors.forEach((err, i) => {
                console.log(`   ${i + 1}. ${err}`);
            });
        } else {
            console.log('   ✅ JavaScriptエラーなし！');
        }
        
        if (warnings.length > 0) {
            console.log('\n⚠️ 検出された警告:');
            warnings.forEach((warn, i) => {
                console.log(`   ${i + 1}. ${warn}`);
            });
        } else {
            console.log('   ✅ kireiline_stores関連の警告なし！');
        }
        
        // 比較表セクションの動作確認
        console.log('\n3. 比較表セクションの確認...');
        const comparisonSection = await page.locator('.comparison-section');
        if (await comparisonSection.count() > 0) {
            console.log('   ✅ 比較表セクションが存在');
            
            // キレイライン矯正のリンクを確認
            const kireilineLink = await page.locator('a:has-text("キレイライン矯正")').first();
            if (await kireilineLink.count() > 0) {
                console.log('   ✅ キレイライン矯正のリンクが存在');
            }
        }
        
        // 詳細リンクの動作確認
        console.log('\n4. 詳細リンクの確認...');
        const detailLinks = await page.locator('a:has-text("詳細")').all();
        console.log(`   - 詳細リンク数: ${detailLinks.length}`);
        
        if (detailLinks.length > 0) {
            // 最初の詳細リンクをクリックしてエラーが出ないか確認
            console.log('   - 最初の詳細リンクをクリックテスト...');
            const beforeErrorCount = errors.length;
            await detailLinks[0].click();
            await page.waitForTimeout(1000);
            const afterErrorCount = errors.length;
            
            if (afterErrorCount === beforeErrorCount) {
                console.log('   ✅ 詳細リンククリックでエラーなし！');
            } else {
                console.log(`   ❌ 詳細リンククリックで新しいエラー: ${errors[errors.length - 1]}`);
            }
        }
        
        console.log('\n=== テスト結果サマリー ===');
        if (errors.length === 0 && warnings.filter(w => w.includes('kireiline_stores')).length === 0) {
            console.log('✅ すべてのエラーが修正されました！');
        } else {
            console.log('❌ まだ問題が残っています');
            if (errors.filter(e => e.includes('link is not defined')).length > 0) {
                console.log('   - "link is not defined"エラーが残存');
            }
            if (warnings.filter(w => w.includes('kireiline_stores')).length > 0) {
                console.log('   - "kireiline_stores"警告が残存');
            }
        }
        
    } catch (error) {
        console.error('テストエラー:', error);
    }
    
    console.log('\nブラウザを開いたままにします。Ctrl+C で終了してください。');
    await page.waitForTimeout(60000);
})();