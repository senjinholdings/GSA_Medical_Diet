const { chromium } = require('playwright');

async function testConsoleDisclaimers() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        if (msg.type() === 'log') {
            console.log('Browser console:', msg.text());
        }
    });
    
    console.log('🔍 Testing clinic disclaimers with console output...\n');
    
    await page.goto('http://localhost:8081/mouthpiece002/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Scroll to comparison section to trigger table generation
    await page.evaluate(() => {
        const section = document.querySelector('.comparison-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
    
    await page.waitForTimeout(2000);
    
    // Check disclaimers collection  
    const disclaimersInfo = await page.evaluate(() => {
        // Find the rankingApp instance
        if (!window.rankingApp) return { error: 'RankingApp not found' };
        
        // Get the clinics being displayed
        const tbody = document.getElementById('comparison-tbody');
        if (!tbody) return { error: 'Table not found' };
        
        const rows = tbody.querySelectorAll('tr');
        const clinicsInTable = [];
        
        rows.forEach(row => {
            const clinicCell = row.querySelector('.clinic-link');
            if (clinicCell) {
                clinicsInTable.push(clinicCell.textContent.trim());
            }
        });
        
        return {
            clinicsInTable: clinicsInTable,
            tableRowCount: rows.length
        };
    });
    
    console.log('\n📊 Table Info:');
    console.log('  Clinics in table:', disclaimersInfo.clinicsInTable);
    console.log('  Row count:', disclaimersInfo.tableRowCount);
    
    // Check the disclaimer content
    const disclaimerButton = await page.$('.main-disclaimer-header');
    if (disclaimerButton) {
        await disclaimerButton.click();
        await page.waitForTimeout(500);
        
        const disclaimerContent = await page.evaluate(() => {
            const content = document.getElementById('main-content');
            if (!content) return { error: 'Content not found' };
            
            return {
                innerHTML: content.innerHTML,
                childCount: content.children.length
            };
        });
        
        console.log('\n📋 Disclaimer Content:');
        console.log('  Child count:', disclaimerContent.childCount);
        if (disclaimerContent.innerHTML) {
            console.log('  Content preview:', disclaimerContent.innerHTML.substring(0, 200));
        }
    }
    
    console.log('\n✅ Test complete!');
    
    await page.waitForTimeout(3000);
    await browser.close();
}

testConsoleDisclaimers().catch(console.error);