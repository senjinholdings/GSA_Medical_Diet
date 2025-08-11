const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🎯 Testing Store Filtering (出し分け) Feature\n');
    
    // Region 000のテスト
    const url = 'http://127.0.0.1:8080/coolsculpting/?region_id=000&max_scroll=50';
    console.log(`📍 Testing Region 000: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // 少し待つ
    await page.waitForTimeout(2000);
    
    // Region 000の出し分けデータを確認
    const region000Data = await page.evaluate(() => {
        if (!window.app || !window.app.dataManager) {
            return { error: 'App not initialized' };
        }
        
        const dm = window.app.dataManager;
        const ranking = dm.getRankingByRegionId('000');
        const storeView = dm.storeViews.find(sv => sv.regionId === '000');
        
        // 各クリニックの表示店舗を確認
        const clinicStores = {};
        if (ranking && ranking.ranks) {
            Object.entries(ranking.ranks).forEach(([pos, clinicId]) => {
                const clinic = dm.clinics.find(c => c.id == clinicId);
                if (clinic) {
                    const stores = dm.getStoreDataForClinic(clinic.code, dm.stores, storeView);
                    clinicStores[clinic.name] = {
                        code: clinic.code,
                        storeCount: stores.length,
                        storeIds: stores.map(s => s.id)
                    };
                }
            });
        }
        
        return {
            storeViewExists: !!storeView,
            storeViewKeys: storeView && storeView.clinicStores ? Object.keys(storeView.clinicStores) : [],
            clinicStores: clinicStores
        };
    });
    
    console.log('\n📊 Region 000 Store Filtering Results:');
    console.log(`  StoreView exists: ${region000Data.storeViewExists ? '✅' : '❌'}`);
    
    if (region000Data.storeViewKeys.length > 0) {
        console.log(`  Available store keys: ${region000Data.storeViewKeys.join(', ')}`);
    }
    
    console.log('\n  Clinics and their filtered stores:');
    Object.entries(region000Data.clinicStores).forEach(([clinicName, data]) => {
        console.log(`    ${clinicName} (${data.code}): ${data.storeCount} stores`);
        if (data.storeCount > 0) {
            console.log(`      Store IDs: ${data.storeIds.join(', ')}`);
        }
    });
    
    // 実際に表示されている店舗を確認
    const displayedStores = await page.evaluate(() => {
        const storeElements = document.querySelectorAll('.store-item, .clinic-store, [data-store-id]');
        return storeElements.length;
    });
    
    console.log(`\n  Displayed store elements: ${displayedStores}`);
    
    // Region 056 (渋谷) のテストも実行
    console.log('\n📍 Testing Region 056 (Shibuya):');
    await page.goto('http://127.0.0.1:8080/coolsculpting/?region_id=056', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const region056Data = await page.evaluate(() => {
        if (!window.app || !window.app.dataManager) {
            return { error: 'App not initialized' };
        }
        
        const dm = window.app.dataManager;
        const ranking = dm.getRankingByRegionId('056');
        const storeView = dm.storeViews.find(sv => sv.regionId === '056');
        
        // DSクリニックの店舗を特に確認
        const dscClinic = dm.clinics.find(c => c.code === 'dsc');
        let dscStores = [];
        if (dscClinic && storeView) {
            dscStores = dm.getStoreDataForClinic('dsc', dm.stores, storeView);
        }
        
        return {
            hasDscInRanking: ranking && ranking.ranks && Object.values(ranking.ranks).includes(dscClinic ? dscClinic.id : '999'),
            dscStoreCount: dscStores.length,
            dscStoreIds: dscStores.map(s => s.id),
            storeViewDsc: storeView && storeView.clinicStores ? storeView.clinicStores.dsc_stores : []
        };
    });
    
    console.log(`  DSクリニック in ranking: ${region056Data.hasDscInRanking ? '✅' : '❌'}`);
    console.log(`  DSクリニック stores: ${region056Data.dscStoreCount}`);
    if (region056Data.dscStoreCount > 0) {
        console.log(`    Store IDs: ${region056Data.dscStoreIds.join(', ')}`);
    }
    console.log(`    StoreView config: ${region056Data.storeViewDsc.join(', ') || 'none'}`);
    
    // スクリーンショット
    await page.screenshot({ path: 'store-filtering-test.png', fullPage: false });
    console.log('\n📸 Screenshot saved as store-filtering-test.png');
    
    await browser.close();
    console.log('\n✨ Store filtering test completed');
    
    // 結果のサマリー
    console.log('\n📋 Summary:');
    if (region000Data.storeViewExists && Object.keys(region000Data.clinicStores).length > 0) {
        console.log('  ✅ Store filtering (出し分け) is working for Region 000');
    } else {
        console.log('  ❌ Store filtering (出し分け) has issues for Region 000');
    }
    
    if (region056Data.dscStoreCount > 0 || region056Data.storeViewDsc.length > 0) {
        console.log('  ✅ DSクリニック configuration found for Region 056');
    } else {
        console.log('  ⚠️ DSクリニック configuration may need review for Region 056');
    }
})();