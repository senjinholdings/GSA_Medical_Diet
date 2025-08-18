const { chromium } = require('playwright');

async function testComparisonTableTabs() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 // Slow down for visual debugging
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('🚀 Starting comparison table tab test...');
    
    try {
        // Navigate to the page
        await page.goto('http://localhost:8081/mouthpiece002/index.html');
        await page.waitForLoadState('networkidle');
        
        console.log('✓ Page loaded');
        
        // Wait for comparison table to be visible
        await page.waitForSelector('#comparison-tbody', { timeout: 5000 });
        console.log('✓ Comparison table found');
        
        // Get initial table state
        const initialTableHTML = await page.evaluate(() => {
            const tbody = document.querySelector('#comparison-tbody');
            return tbody ? tbody.innerHTML : null;
        });
        
        // Find and click tabs
        const tabs = await page.$$('.tab-button, .comparison-tab, [data-tab]');
        console.log(`Found ${tabs.length} tab buttons`);
        
        // Test each tab
        for (let i = 0; i < tabs.length; i++) {
            const tabText = await tabs[i].textContent();
            console.log(`\n📋 Testing tab ${i + 1}: "${tabText}"`);
            
            // Take screenshot before click
            await page.screenshot({ 
                path: `screenshots/before-tab-${i}.png`,
                fullPage: false,
                clip: { x: 0, y: 400, width: 1200, height: 600 }
            });
            
            // Click the tab
            await tabs[i].click();
            await page.waitForTimeout(1000);
            
            // Take screenshot after click
            await page.screenshot({ 
                path: `screenshots/after-tab-${i}.png`,
                fullPage: false,
                clip: { x: 0, y: 400, width: 1200, height: 600 }
            });
            
            // Check table structure
            const tableCheck = await page.evaluate(() => {
                const tbody = document.querySelector('#comparison-tbody');
                const thead = document.querySelector('#comparison-header-row');
                
                return {
                    tbodyExists: !!tbody,
                    theadExists: !!thead,
                    rowCount: tbody ? tbody.children.length : 0,
                    headerCount: thead ? thead.children.length : 0,
                    firstRowCellCount: tbody && tbody.children[0] ? tbody.children[0].children.length : 0,
                    visibleHeaders: thead ? Array.from(thead.children).map(th => ({
                        text: th.textContent,
                        display: window.getComputedStyle(th).display,
                        visibility: window.getComputedStyle(th).visibility
                    })) : []
                };
            });
            
            console.log('Table state after clicking tab:');
            console.log(`  - Rows: ${tableCheck.rowCount}`);
            console.log(`  - Headers: ${tableCheck.headerCount}`);
            console.log(`  - First row cells: ${tableCheck.firstRowCellCount}`);
            console.log(`  - Visible headers:`, tableCheck.visibleHeaders.filter(h => h.display !== 'none').map(h => h.text));
            
            // Check for layout issues
            const layoutIssues = await page.evaluate(() => {
                const issues = [];
                const tbody = document.querySelector('#comparison-tbody');
                const thead = document.querySelector('#comparison-header-row');
                
                if (tbody && thead) {
                    const headerCount = thead.children.length;
                    const rows = tbody.querySelectorAll('tr');
                    
                    rows.forEach((row, index) => {
                        const cellCount = row.children.length;
                        if (cellCount !== headerCount) {
                            issues.push(`Row ${index + 1}: ${cellCount} cells vs ${headerCount} headers`);
                        }
                    });
                    
                    // Check for misaligned columns
                    const headerWidths = Array.from(thead.children).map(th => th.offsetWidth);
                    if (rows[0]) {
                        const cellWidths = Array.from(rows[0].children).map(td => td.offsetWidth);
                        headerWidths.forEach((hw, i) => {
                            if (cellWidths[i] && Math.abs(hw - cellWidths[i]) > 5) {
                                issues.push(`Column ${i + 1}: Header width ${hw}px vs Cell width ${cellWidths[i]}px`);
                            }
                        });
                    }
                }
                
                return issues;
            });
            
            if (layoutIssues.length > 0) {
                console.log('⚠️  Layout issues detected:');
                layoutIssues.forEach(issue => console.log(`    - ${issue}`));
            } else {
                console.log('✓ No layout issues detected');
            }
        }
        
        // Check console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Console error:', msg.text());
            }
        });
        
        console.log('\n✅ Test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
    }
    
    // Keep browser open for manual inspection
    console.log('\n👀 Browser will stay open for manual inspection. Press Ctrl+C to close.');
    await page.waitForTimeout(60000);
    
    await browser.close();
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

testComparisonTableTabs();