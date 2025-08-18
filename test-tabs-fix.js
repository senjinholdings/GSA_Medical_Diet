const { chromium } = require('playwright');

async function testAndFixTabs() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    const page = await browser.newPage();
    
    console.log('🚀 Starting tab diagnosis...\n');
    
    try {
        await page.goto('http://localhost:8081/mouthpiece002/index.html');
        await page.waitForLoadState('networkidle');
        console.log('✓ Page loaded');
        
        // Scroll to comparison table section
        await page.evaluate(() => {
            const comparisonSection = document.querySelector('.comparison-table');
            if (comparisonSection) {
                comparisonSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        await page.waitForTimeout(1000);
        
        // Check tab structure
        const tabInfo = await page.evaluate(() => {
            const tabs = document.querySelectorAll('.comparison-tab-menu-item');
            const tabMenu = document.querySelector('.comparison-tab-menu');
            const table = document.querySelector('#comparison-table');
            
            return {
                tabCount: tabs.length,
                tabs: Array.from(tabs).map((tab, i) => ({
                    index: i,
                    text: tab.textContent.trim(),
                    dataTab: tab.getAttribute('data-tab'),
                    classes: tab.className,
                    isActive: tab.classList.contains('tab-active'),
                    rect: tab.getBoundingClientRect(),
                    computedStyle: {
                        display: window.getComputedStyle(tab).display,
                        visibility: window.getComputedStyle(tab).visibility,
                        pointerEvents: window.getComputedStyle(tab).pointerEvents,
                        zIndex: window.getComputedStyle(tab).zIndex,
                        position: window.getComputedStyle(tab).position
                    }
                })),
                menuRect: tabMenu ? tabMenu.getBoundingClientRect() : null,
                tableRect: table ? table.getBoundingClientRect() : null
            };
        });
        
        console.log(`Found ${tabInfo.tabCount} tabs:`);
        tabInfo.tabs.forEach(tab => {
            console.log(`  Tab ${tab.index + 1}: "${tab.text}" (${tab.dataTab})`);
            console.log(`    - Active: ${tab.isActive}`);
            console.log(`    - Pointer Events: ${tab.computedStyle.pointerEvents}`);
            console.log(`    - Position: top=${tab.rect.top}, left=${tab.rect.left}`);
        });
        
        // Try clicking non-active tabs
        console.log('\n🔄 Testing tab clicks...');
        
        for (let i = 0; i < tabInfo.tabs.length; i++) {
            const tab = tabInfo.tabs[i];
            if (!tab.isActive) {
                console.log(`\nClicking tab: "${tab.text}"`);
                
                // Try different click methods
                try {
                    // Method 1: Direct click with force
                    await page.click(`.comparison-tab-menu-item[data-tab="${tab.dataTab}"]`, { 
                        force: true,
                        timeout: 5000 
                    });
                    console.log('  ✓ Click successful');
                } catch (e1) {
                    console.log('  ⚠️ Direct click failed, trying JavaScript click...');
                    
                    // Method 2: JavaScript click
                    await page.evaluate((dataTab) => {
                        const tabElement = document.querySelector(`.comparison-tab-menu-item[data-tab="${dataTab}"]`);
                        if (tabElement) {
                            tabElement.click();
                        }
                    }, tab.dataTab);
                    console.log('  ✓ JavaScript click executed');
                }
                
                await page.waitForTimeout(500);
                
                // Check table state after click
                const tableState = await page.evaluate(() => {
                    const activeTab = document.querySelector('.comparison-tab-menu-item.tab-active');
                    const headers = document.querySelectorAll('#comparison-header-row th');
                    const visibleHeaders = Array.from(headers).filter(th => {
                        const style = window.getComputedStyle(th);
                        return style.display !== 'none' && style.visibility !== 'hidden';
                    });
                    
                    return {
                        activeTabText: activeTab ? activeTab.textContent.trim() : 'None',
                        activeTabData: activeTab ? activeTab.getAttribute('data-tab') : 'None',
                        totalHeaders: headers.length,
                        visibleHeaders: visibleHeaders.length,
                        visibleHeaderTexts: visibleHeaders.map(h => h.textContent.trim())
                    };
                });
                
                console.log(`  Active tab: "${tableState.activeTabText}" (${tableState.activeTabData})`);
                console.log(`  Visible columns: ${tableState.visibleHeaders} of ${tableState.totalHeaders}`);
                console.log(`  Headers: ${tableState.visibleHeaderTexts.join(', ')}`);
            }
        }
        
        // Check if the tab click handler is properly set up
        console.log('\n🔍 Checking event listeners...');
        const hasEventListeners = await page.evaluate(() => {
            const tabs = document.querySelectorAll('.comparison-tab-menu-item');
            const results = [];
            
            tabs.forEach((tab, i) => {
                // Check if onclick is set
                const hasOnclick = !!tab.onclick;
                
                // Try to trigger the click event
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                
                // Check if the tab has any response to click
                const beforeActive = tab.classList.contains('tab-active');
                tab.dispatchEvent(event);
                const afterActive = tab.classList.contains('tab-active');
                
                results.push({
                    index: i,
                    text: tab.textContent.trim(),
                    hasOnclick,
                    respondedToClick: beforeActive !== afterActive
                });
            });
            
            return results;
        });
        
        console.log('Event listener check:');
        hasEventListeners.forEach(tab => {
            console.log(`  Tab "${tab.text}": onclick=${tab.hasOnclick}, responds=${tab.respondedToClick}`);
        });
        
        console.log('\n✅ Diagnosis complete!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        await page.screenshot({ path: 'screenshots/error-diagnosis.png', fullPage: true });
    }
    
    console.log('\n👀 Keeping browser open for inspection...');
    await page.waitForTimeout(30000);
    
    await browser.close();
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
}

testAndFixTabs();