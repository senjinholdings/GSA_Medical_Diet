const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Testing coolsculpting page with Playwright...\n');
    
    // エラーを記録
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
            console.log(`❌ Console Error: ${msg.text()}`);
        }
    });
    
    page.on('pageerror', error => {
        errors.push(error.message);
        console.log(`❌ Page Error: ${error.message}`);
    });
    
    // ページを開く
    const url = 'http://127.0.0.1:8080/coolsculpting/?region_id=000&max_scroll=50';
    console.log(`📍 Opening: ${url}\n`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // ページタイトルを確認
    const title = await page.title();
    console.log(`📄 Page Title: ${title}`);
    
    // 重要な要素の存在確認
    console.log('\n🔎 Checking key elements:');
    
    // 1. clinic-details-listが存在するか
    const detailsList = await page.$('#clinic-details-list');
    console.log(`  clinic-details-list: ${detailsList ? '✅ Found' : '❌ Not found'}`);
    
    // 2. ランキングボックスが存在するか
    const rankingBoxes = await page.$$('.ranking_box_inner');
    console.log(`  Ranking boxes: ${rankingBoxes.length > 0 ? `✅ ${rankingBoxes.length} found` : '❌ None found'}`);
    
    // 3. クリニックカードが存在するか
    const clinicCards = await page.$$('.clinic-card');
    console.log(`  Clinic cards: ${clinicCards.length > 0 ? `✅ ${clinicCards.length} found` : '❌ None found'}`);
    
    // 4. 詳細アイテムが存在するか
    const detailItems = await page.$$('.detail-item');
    console.log(`  Detail items: ${detailItems.length > 0 ? `✅ ${detailItems.length} found` : '❌ None found'}`);
    
    // JavaScriptが正しく実行されているか確認
    console.log('\n💻 Checking JavaScript execution:');
    
    // MedicalAppが存在するか
    const hasMedicalApp = await page.evaluate(() => {
        return typeof window.MedicalApp !== 'undefined';
    });
    console.log(`  MedicalApp class: ${hasMedicalApp ? '✅ Loaded' : '❌ Not loaded'}`);
    
    // appインスタンスが存在するか
    const hasAppInstance = await page.evaluate(() => {
        return typeof window.app !== 'undefined';
    });
    console.log(`  App instance: ${hasAppInstance ? '✅ Created' : '❌ Not created'}`);
    
    // dataManagerが初期化されているか
    if (hasAppInstance) {
        const dataManagerStatus = await page.evaluate(() => {
            if (window.app && window.app.dataManager) {
                return {
                    exists: true,
                    hasRegions: window.app.dataManager.regions && window.app.dataManager.regions.length > 0,
                    hasClinics: window.app.dataManager.clinics && window.app.dataManager.clinics.length > 0,
                    hasRankings: window.app.dataManager.rankings && window.app.dataManager.rankings.length > 0
                };
            }
            return { exists: false };
        });
        
        if (dataManagerStatus.exists) {
            console.log(`  DataManager: ✅ Initialized`);
            console.log(`    - Regions: ${dataManagerStatus.hasRegions ? '✅' : '❌'}`);
            console.log(`    - Clinics: ${dataManagerStatus.hasClinics ? '✅' : '❌'}`);
            console.log(`    - Rankings: ${dataManagerStatus.hasRankings ? '✅' : '❌'}`);
        } else {
            console.log(`  DataManager: ❌ Not initialized`);
        }
    }
    
    // Region 000のデータを確認
    console.log('\n📊 Checking Region 000 data:');
    const region000Data = await page.evaluate(() => {
        if (window.app && window.app.dataManager) {
            const ranking = window.app.dataManager.getRankingByRegionId('000');
            const storeView = window.app.dataManager.storeViews.find(sv => sv.regionId === '000');
            return {
                hasRanking: !!ranking,
                rankingDetails: ranking ? ranking.ranks : null,
                hasStoreView: !!storeView,
                storeViewKeys: storeView && storeView.clinicStores ? Object.keys(storeView.clinicStores) : []
            };
        }
        return null;
    });
    
    if (region000Data) {
        console.log(`  Ranking: ${region000Data.hasRanking ? '✅ Found' : '❌ Not found'}`);
        if (region000Data.rankingDetails) {
            console.log(`    Rankings: ${JSON.stringify(region000Data.rankingDetails, null, 2)}`);
        }
        console.log(`  StoreView: ${region000Data.hasStoreView ? '✅ Found' : '❌ Not found'}`);
        if (region000Data.storeViewKeys.length > 0) {
            console.log(`    Store keys: ${region000Data.storeViewKeys.join(', ')}`);
        }
    }
    
    // エラーサマリー
    console.log('\n📋 Summary:');
    if (errors.length > 0) {
        console.log(`  ❌ ${errors.length} JavaScript errors found`);
        errors.forEach((err, i) => {
            console.log(`    ${i + 1}. ${err}`);
        });
    } else {
        console.log(`  ✅ No JavaScript errors`);
    }
    
    // 問題の診断
    console.log('\n🔧 Diagnosis:');
    if (rankingBoxes.length === 0 && hasAppInstance) {
        console.log('  ⚠️ App is loaded but ranking boxes are not rendered');
        console.log('  Possible issues:');
        console.log('    - updateClinicDetails method may not be called');
        console.log('    - Data may not be loaded correctly');
        console.log('    - DOM elements may not be properly created');
    }
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'coolsculpting-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved as coolsculpting-test.png');
    
    // 5秒待って変化を観察
    console.log('\n⏳ Waiting 5 seconds to observe any delayed rendering...');
    await page.waitForTimeout(5000);
    
    // 再度ランキングボックスを確認
    const rankingBoxesAfter = await page.$$('.ranking_box_inner');
    if (rankingBoxesAfter.length > rankingBoxes.length) {
        console.log(`  ✅ Ranking boxes appeared after delay: ${rankingBoxesAfter.length}`);
    } else if (rankingBoxesAfter.length === 0) {
        console.log(`  ❌ Still no ranking boxes after 5 seconds`);
    }
    
    await browser.close();
    console.log('\n✨ Test completed');
})();