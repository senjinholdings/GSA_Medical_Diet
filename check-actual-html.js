const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--disable-http-cache']
    });
    const page = await browser.newPage();

    console.log('📋 実際のHTML確認\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // タイムスタンプ付きでアクセス（キャッシュ回避）
    const timestamp = Date.now();
    await page.goto(`http://localhost:3000/mouthpiece/?region_id=013&_nocache=${timestamp}`);
    await page.waitForLoadState('networkidle');
    
    // ServiceWorkerを無効化
    await page.evaluate(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    registration.unregister();
                    console.log('ServiceWorker unregistered');
                });
            });
        }
    });
    
    await page.waitForTimeout(2000);

    // Oh my teethの詳細セクションに移動
    const omtCard = await page.locator('.clinic-card').filter({ hasText: 'Oh my teeth' }).first();
    if (await omtCard.count() > 0) {
        await omtCard.locator('a').first().click();
        await page.waitForTimeout(2000);
        
        // 詳細セクションまでスクロール
        await page.evaluate(() => {
            const detailSection = document.querySelector('#detail-1');
            if (detailSection) {
                detailSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        
        await page.waitForTimeout(1500);
        
        console.log('1️⃣ 実際のHTMLを確認:\n');
        
        // 最初の店舗のHTMLを取得
        const shopHTML = await page.evaluate(() => {
            const firstShop = document.querySelector('.shop');
            if (firstShop) {
                const link = firstShop.querySelector('.shop-name a');
                return {
                    fullHTML: firstShop.innerHTML,
                    linkHTML: link ? link.outerHTML : null,
                    linkHref: link ? link.getAttribute('href') : null,
                    linkOnclick: link ? link.getAttribute('onclick') : null
                };
            }
            return null;
        });
        
        if (shopHTML) {
            console.log('店舗リンクの状態:');
            console.log('  href:', shopHTML.linkHref);
            console.log('  onclick:', shopHTML.linkOnclick || 'なし');
            console.log('\nリンクのHTML:');
            console.log('  ', shopHTML.linkHTML);
        }
        
        console.log('\n2️⃣ generateStoresDisplay関数の状態:\n');
        
        // 関数の内容を確認
        const funcCheck = await page.evaluate(() => {
            if (window.app && window.app.dataManager) {
                const func = window.app.dataManager.generateStoresDisplay.toString();
                
                // onclickハンドラーの部分を探す
                const onclickIndex = func.indexOf('onclick');
                const windowOpenIndex = func.indexOf('window.open');
                const goPathIndex = func.indexOf('./go/');
                
                // href="#" があるか確認
                const hrefHashIndex = func.indexOf('href="#"');
                const hrefGoIndex = func.indexOf('href="./go/');
                
                return {
                    hasOnclick: onclickIndex > -1,
                    hasWindowOpen: windowOpenIndex > -1,
                    hasGoPath: goPathIndex > -1,
                    hasHrefHash: hrefHashIndex > -1,
                    hasHrefGo: hrefGoIndex > -1,
                    // 実際のhref部分を抽出
                    hrefPart: hrefHashIndex > -1 ? 
                        func.substring(hrefHashIndex, hrefHashIndex + 50) :
                        (hrefGoIndex > -1 ? func.substring(hrefGoIndex, hrefGoIndex + 50) : null)
                };
            }
            return null;
        });
        
        if (funcCheck) {
            console.log('generateStoresDisplay関数の分析:');
            console.log('  onclick属性:', funcCheck.hasOnclick ? '✅ あり' : '❌ なし');
            console.log('  window.open:', funcCheck.hasWindowOpen ? '✅ あり' : '❌ なし');
            console.log('  ./go/パス:', funcCheck.hasGoPath ? '✅ あり' : '❌ なし');
            console.log('  href="#":', funcCheck.hasHrefHash ? '✅ あり' : '❌ なし');
            console.log('  href="./go/:', funcCheck.hasHrefGo ? '✅ あり' : '❌ なし');
            
            if (funcCheck.hrefPart) {
                console.log('\n  href部分のコード:');
                console.log('  ', funcCheck.hrefPart);
            }
        }
        
        console.log('\n3️⃣ 手動で修正を適用してテスト:\n');
        
        // 直接修正を適用
        await page.evaluate(() => {
            const links = document.querySelectorAll('.shop-name a');
            links.forEach(link => {
                // 現在のhrefを保存
                const originalHref = link.getAttribute('href');
                
                // テスト用のonclickハンドラーを追加
                link.setAttribute('href', '#');
                link.setAttribute('onclick', "alert('クリックされました！公式サイトを開きます'); window.open('https://oh-my-teeth.com', '_blank'); return false;");
                link.style.color = 'red';
                link.style.fontWeight = 'bold';
                
                console.log('リンク修正:', originalHref, '→', 'onclick with window.open');
            });
        });
        
        console.log('✅ 手動で修正を適用しました');
        
        // 修正後のリンクを確認
        const modifiedLink = await page.evaluate(() => {
            const link = document.querySelector('.shop-name a');
            return {
                href: link.getAttribute('href'),
                onclick: link.getAttribute('onclick'),
                style: link.style.cssText
            };
        });
        
        console.log('\n修正後のリンク:');
        console.log('  href:', modifiedLink.href);
        console.log('  onclick:', modifiedLink.onclick ? '設定済み' : 'なし');
        console.log('  スタイル:', modifiedLink.style);
        
        console.log('\n4️⃣ クリックテスト:\n');
        console.log('店舗名（赤色）をクリックしてください。');
        console.log('アラートが表示され、Oh my teeth公式サイトが開けば成功です。');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('確認完了\n');

    await page.waitForTimeout(10000);
    await browser.close();
})();