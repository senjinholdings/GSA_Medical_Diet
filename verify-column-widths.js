const { chromium } = require('playwright');

async function verifyColumnWidths() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100
    });
    
    const page = await browser.newPage();
    
    console.log('🔍 Verifying column widths with 18% for official site column...\n');
    
    await page.goto('http://localhost:8081/mouthpiece002/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Scroll to comparison section
    await page.evaluate(() => {
        const section = document.querySelector('.comparison-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(1000);
    
    const tabs = [
        { id: 'tab1', name: '総合', columns: ['クリニック名', '総合評価', '費用', '特徴', '公式サイト'] },
        { id: 'tab2', name: '施術内容', columns: ['クリニック名', '矯正範囲', '目安期間', '通院頻度', '公式サイト'] },
        { id: 'tab3', name: 'サービス', columns: ['クリニック名', '実績/症例数', 'ワイヤー矯正の紹介', 'サポート', '公式サイト'] }
    ];
    
    for (const tab of tabs) {
        console.log(`\n📊 Testing ${tab.name} tab (${tab.id}):`);
        
        // Click the tab
        await page.click(`[data-tab="${tab.id}"]`, { force: true });
        await page.waitForTimeout(500);
        
        // Get visible column widths
        const columnData = await page.evaluate((tabId) => {
            const table = document.getElementById('comparison-table');
            const headers = Array.from(table.querySelectorAll('thead th')).filter(th => 
                th.style.display !== 'none' && !th.classList.contains('th-none')
            );
            
            return headers.map(th => {
                const computed = window.getComputedStyle(th);
                const tableWidth = table.offsetWidth;
                const thWidth = th.offsetWidth;
                const percentage = (thWidth / tableWidth * 100).toFixed(2);
                
                return {
                    text: th.textContent.trim(),
                    width: computed.width,
                    offsetWidth: thWidth,
                    percentage: percentage + '%'
                };
            });
        }, tab.id);
        
        console.log('  Visible columns:');
        columnData.forEach((col, index) => {
            const expectedWidth = index === 0 ? '17%' : 
                                index === columnData.length - 1 ? '18%' : 
                                '~21.67%';
            const isCorrect = (index === 0 && parseFloat(col.percentage) >= 16.5 && parseFloat(col.percentage) <= 17.5) ||
                            (index === columnData.length - 1 && parseFloat(col.percentage) >= 17.5 && parseFloat(col.percentage) <= 18.5) ||
                            (index > 0 && index < columnData.length - 1 && parseFloat(col.percentage) >= 21 && parseFloat(col.percentage) <= 22.5);
            
            console.log(`    ${index + 1}. ${col.text}: ${col.percentage} (expected: ${expectedWidth}) ${isCorrect ? '✓' : '✗'}`);
        });
        
        // Verify total width
        const totalPercentage = columnData.reduce((sum, col) => sum + parseFloat(col.percentage), 0);
        console.log(`  Total width: ${totalPercentage.toFixed(2)}% ${Math.abs(totalPercentage - 100) < 1 ? '✓' : '✗'}`);
        
        // Specific verification for official site column
        const lastColumn = columnData[columnData.length - 1];
        const officialSiteWidth = parseFloat(lastColumn.percentage);
        if (officialSiteWidth >= 17.5 && officialSiteWidth <= 18.5) {
            console.log(`  ✅ Official site column is correctly set to ~18% (${lastColumn.percentage})`);
        } else {
            console.log(`  ⚠️ Official site column width is ${lastColumn.percentage}, expected ~18%`);
        }
    }
    
    console.log('\n📊 Summary:');
    console.log('  Expected column widths:');
    console.log('  - クリニック名: 17%');
    console.log('  - Middle columns: ~21.67% each');
    console.log('  - 公式サイト: 18%');
    console.log('  - Total: 100%');
    
    await page.waitForTimeout(3000);
    await browser.close();
    
    console.log('\n✅ Verification complete!');
}

verifyColumnWidths().catch(console.error);