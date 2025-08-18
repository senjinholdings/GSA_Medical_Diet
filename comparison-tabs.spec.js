const { test, expect } = require('@playwright/test');

test.describe('比較表タブ機能 E2E テスト', () => {
    test.beforeEach(async ({ page }) => {
        // テストページを開く
        await page.goto('http://localhost:3000/');
        
        // ページが完全にロードされるまで待機
        await page.waitForLoadState('networkidle');
        
        // 比較表が表示されるまで待機
        await page.waitForSelector('#comparison-table', { timeout: 10000 });
        
        // JavaScriptの初期化完了を待機
        await page.waitForTimeout(2000);
    });

    test('初期状態で総合タブがアクティブで正しい列が表示される', async ({ page }) => {
        // 総合タブがアクティブかチェック
        const activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
        await expect(activeTab).toContainText('総合');
        
        // 総合タブで表示される列をチェック
        const table = page.locator('#comparison-table');
        
        // 表示される列: クリニック、総合評価、費用、特徴、公式サイト
        const visibleHeaders = await table.locator('thead th:visible').allTextContents();
        console.log('表示されているヘッダー:', visibleHeaders);
        
        expect(visibleHeaders).toContain('クリニック');
        expect(visibleHeaders).toContain('総合評価');
        expect(visibleHeaders).toContain('費用');
        expect(visibleHeaders).toContain('特徴');
        expect(visibleHeaders).toContain('公式サイト');
        
        // 非表示の列をチェック（矯正範囲、目安期間、通院頻度などが非表示）
        const hiddenHeaders = await table.locator('thead th[style*="display: none"]').count();
        expect(hiddenHeaders).toBeGreaterThan(0);
        
        // データ行もチェック
        const visibleCells = await table.locator('tbody tr:first-child td:visible').count();
        expect(visibleCells).toBe(5); // 5列が表示されているはず
    });

    test('施術内容タブをクリックすると正しい列が表示される', async ({ page }) => {
        // 施術内容タブをクリック
        await page.click('.comparison-tab-menu-item[data-tab="tab2"]');
        
        // タブがアクティブになるのを待機
        await page.waitForTimeout(500);
        
        // 施術内容タブがアクティブになったかチェック
        const activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
        await expect(activeTab).toContainText('施術内容');
        
        // 施術内容タブで表示される列をチェック
        const table = page.locator('#comparison-table');
        const visibleHeaders = await table.locator('thead th:visible').allTextContents();
        console.log('施術内容タブのヘッダー:', visibleHeaders);
        
        expect(visibleHeaders).toContain('クリニック');
        expect(visibleHeaders).toContain('矯正範囲');
        expect(visibleHeaders).toContain('目安期間');
        expect(visibleHeaders).toContain('通院頻度');
        expect(visibleHeaders).toContain('公式サイト');
        
        // 総合評価や費用は非表示になっているはず
        const totalEvaluationVisible = await table.locator('thead th:visible').filter({ hasText: '総合評価' }).count();
        const costVisible = await table.locator('thead th:visible').filter({ hasText: '費用' }).count();
        expect(totalEvaluationVisible).toBe(0);
        expect(costVisible).toBe(0);
    });

    test('サービスタブをクリックすると正しい列が表示される', async ({ page }) => {
        // サービスタブをクリック
        await page.click('.comparison-tab-menu-item[data-tab="tab3"]');
        
        // タブがアクティブになるのを待機
        await page.waitForTimeout(500);
        
        // サービスタブがアクティブになったかチェック
        const activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
        await expect(activeTab).toContainText('サービス');
        
        // サービスタブで表示される列をチェック
        const table = page.locator('#comparison-table');
        const visibleHeaders = await table.locator('thead th:visible').allTextContents();
        console.log('サービスタブのヘッダー:', visibleHeaders);
        
        expect(visibleHeaders).toContain('クリニック');
        expect(visibleHeaders).toContain('実績/症例数');
        expect(visibleHeaders).toContain('ワイヤー矯正の紹介');
        expect(visibleHeaders).toContain('サポート');
        expect(visibleHeaders).toContain('公式サイト');
    });

    test('タブを切り替えても公式サイトボタンが常に表示される', async ({ page }) => {
        const tabs = [
            { selector: '[data-tab="tab1"]', name: '総合' },
            { selector: '[data-tab="tab2"]', name: '施術内容' },
            { selector: '[data-tab="tab3"]', name: 'サービス' }
        ];
        
        for (const tab of tabs) {
            await page.click(`.comparison-tab-menu-item${tab.selector}`);
            await page.waitForTimeout(500);
            
            // 公式サイトボタンが表示されていることをチェック
            const officialSiteButtons = await page.locator('#comparison-table tbody tr td:visible a').filter({ hasText: '公式サイト' }).count();
            expect(officialSiteButtons).toBeGreaterThan(0);
            console.log(`${tab.name}タブ: 公式サイトボタン ${officialSiteButtons}個 表示中`);
        }
    });

    test('クリニック名とロゴが正しく対応している', async ({ page }) => {
        // 総合タブで確認
        const table = page.locator('#comparison-table tbody');
        
        // 最初の行のクリニック名を取得
        const firstClinicName = await table.locator('tr:first-child td:first-child a').textContent();
        const firstClinicLogo = await table.locator('tr:first-child td:first-child img').getAttribute('alt');
        
        console.log('最初のクリニック名:', firstClinicName);
        console.log('最初のクリニックロゴのalt:', firstClinicLogo);
        
        // クリニック名とロゴのaltが一致することを確認
        expect(firstClinicName?.trim()).toBe(firstClinicLogo?.trim());
        
        // Oh my teethの場合の特定のチェック
        if (firstClinicName?.includes('Oh my teeth')) {
            expect(firstClinicLogo).toContain('Oh my teeth');
            
            // Oh my teethの行のデータが正しいかチェック
            const firstRowData = await table.locator('tr:first-child td:visible').allTextContents();
            console.log('Oh my teethの行データ:', firstRowData);
            
            // 総合評価が4.9であることをチェック（データが正しく対応していれば）
            expect(firstRowData.some(cell => cell.includes('4.9'))).toBeTruthy();
        }
    });

    test('全てのタブでデータ行数が一致する', async ({ page }) => {
        const tabs = ['tab1', 'tab2', 'tab3'];
        let rowCounts = [];
        
        for (const tab of tabs) {
            await page.click(`.comparison-tab-menu-item[data-tab="${tab}"]`);
            await page.waitForTimeout(500);
            
            const rowCount = await page.locator('#comparison-table tbody tr').count();
            rowCounts.push(rowCount);
            console.log(`${tab}: ${rowCount}行`);
        }
        
        // 全てのタブで行数が同じであることを確認
        expect(rowCounts[0]).toBe(rowCounts[1]);
        expect(rowCounts[1]).toBe(rowCounts[2]);
        expect(rowCounts[0]).toBeGreaterThan(0);
    });

    test('タブ切り替えアニメーションとUXをチェック', async ({ page }) => {
        // 初期状態の記録
        await page.screenshot({ path: 'test-results/tab-initial-state.png', fullPage: true });
        
        // 施術内容タブに切り替え
        await page.click('.comparison-tab-menu-item[data-tab="tab2"]');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/tab-treatment-state.png', fullPage: true });
        
        // サービスタブに切り替え
        await page.click('.comparison-tab-menu-item[data-tab="tab3"]');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/tab-service-state.png', fullPage: true });
        
        // 総合タブに戻る
        await page.click('.comparison-tab-menu-item[data-tab="tab1"]');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/tab-back-to-general.png', fullPage: true });
        
        // 最終的に総合タブがアクティブなことを確認
        const activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
        await expect(activeTab).toContainText('総合');
    });

    test('レスポンシブ表示での動作確認', async ({ page }) => {
        // モバイル表示でテスト
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        
        // タブが表示されているかチェック
        const tabMenu = page.locator('.comparison-tab-menu');
        await expect(tabMenu).toBeVisible();
        
        // タブ切り替えが動作するかチェック
        await page.click('.comparison-tab-menu-item[data-tab="tab2"]');
        await page.waitForTimeout(500);
        
        const activeTab = await page.locator('.comparison-tab-menu-item.tab-active');
        await expect(activeTab).toContainText('施術内容');
        
        // スクリーンショット撮影
        await page.screenshot({ path: 'test-results/mobile-tab-view.png', fullPage: true });
    });
});

test.describe('エラーハンドリングテスト', () => {
    test('JavaScriptエラーが発生していないことを確認', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.goto('http://localhost:3000/');
        await page.waitForTimeout(3000);
        
        // タブを全て切り替えてエラーをチェック
        const tabs = ['tab1', 'tab2', 'tab3'];
        for (const tab of tabs) {
            await page.click(`.comparison-tab-menu-item[data-tab="${tab}"]`);
            await page.waitForTimeout(500);
        }
        
        console.log('検出されたエラー:', errors);
        expect(errors.length).toBe(0);
    });
});