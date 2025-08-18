const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('=== Debug region_id=000 ===');
    
    // コンソールエラーをキャッチ（初期化前）
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('Console error:', msg.text());
        } else if (msg.type() === 'warn') {
            console.log('Console warn:', msg.text());
        } else if (msg.type() === 'log') {
            console.log('Console log:', msg.text());
        }
    });
    
    // ページエラーをキャッチ（初期化前）
    page.on('pageerror', error => {
        console.log('Page error:', error.message);
    });
    
    // ページにアクセス
    await page.goto('http://localhost:3000/mouthpiece002/?region_id=000');
    
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // JavaScriptを実行してデバッグ情報を取得
    const debugInfo = await page.evaluate(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const regionId = urlParams.get('region_id') || '000';
        
        const mvElement = document.getElementById('mv-region-name');
        const detailElement = document.getElementById('detail-region-name');
        
        return {
            urlRegionId: regionId,
            mvText: mvElement ? mvElement.textContent : 'not found',
            detailText: detailElement ? detailElement.textContent : 'not found',
            hasRankingApp: typeof window.rankingApp !== 'undefined',
            hasApp: typeof window.app !== 'undefined',
            hasDataManager: window.app && window.app.dataManager ? true : false,
            appCurrentRegionId: window.app ? window.app.currentRegionId : 'undefined',
            windowKeys: Object.keys(window).filter(key => key.includes('app') || key.includes('ranking')).join(', ')
        };
    });
    
    console.log('Debug info:', debugInfo);
    
    // 更に詳細なデバッグ - DataManagerの状態を確認
    if (debugInfo.hasDataManager) {
        const dataManagerInfo = await page.evaluate(() => {
            const regionId = '000';
            const mappedId = window.app.dataManager.mapRegionId(regionId);
            
            return {
                originalRegionId: regionId,
                mappedRegionId: mappedId,
                mapRegionIdResult: mappedId
            };
        });
        
        console.log('DataManager info:', dataManagerInfo);
        
        // 手動で地域名を強制更新してテスト
        const manualUpdateResult = await page.evaluate(() => {
            // 全国の地域オブジェクトを作成
            const region = {
                id: '000',
                name: '全国',
                parentId: null
            };
            
            // 地域名を手動で更新
            const mvRegionElement = document.getElementById('mv-region-name');
            if (mvRegionElement) {
                mvRegionElement.textContent = region.name;
            }
            
            const detailRegionElement = document.getElementById('detail-region-name');
            if (detailRegionElement) {
                detailRegionElement.textContent = region.name + 'で人気のクリニック';
            }
            
            return {
                updated: true,
                mvText: mvRegionElement ? mvRegionElement.textContent : 'not found',
                detailText: detailRegionElement ? detailRegionElement.textContent : 'not found'
            };
        });
        
        console.log('Manual update result:', manualUpdateResult);
    }
    
    // 5秒間待機してから閉じる
    await page.waitForTimeout(5000);
    
    await browser.close();
})();