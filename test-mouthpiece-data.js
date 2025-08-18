const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
            console.log('❌ Console Error:', text);
        } else if (type === 'warning') {
            console.log('⚠️ Console Warning:', text);
        } else {
            console.log('✓ Console:', text);
        }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
        console.log('❌ Page Error:', error.message);
    });
    
    await page.goto('http://localhost:8081/mouthpiece/index.html');
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Check if DataManager is initialized
    const dataCheck = await page.evaluate(() => {
        const results = {};
        
        // Check if dataManager exists
        results.dataManagerExists = typeof window.dataManager !== 'undefined';
        
        if (window.dataManager) {
            // Check clinics
            results.clinicsCount = window.dataManager.clinics ? window.dataManager.clinics.length : 0;
            results.clinics = window.dataManager.clinics ? window.dataManager.clinics.map(c => ({
                id: c.id,
                name: c.name,
                code: c.code
            })) : [];
            
            // Check clinic texts
            results.clinicTextsLoaded = window.dataManager.clinicTexts ? true : false;
            results.clinicTextKeys = window.dataManager.clinicTexts ? Object.keys(window.dataManager.clinicTexts) : [];
            
            // Check rankings for region 13
            const ranking = window.dataManager.getRankingByRegionId('13');
            results.rankingFor13 = ranking ? ranking.ranks : null;
            
            // Check comparison table
            const tbody = document.getElementById('comparison-tbody');
            results.comparisonRows = tbody ? tbody.children.length : 0;
            
            // Check first row content
            if (tbody && tbody.children[0]) {
                const firstRow = tbody.children[0];
                results.firstClinicName = firstRow.querySelector('.clinic-link') ? firstRow.querySelector('.clinic-link').textContent : 'Not found';
                results.firstClinicRating = firstRow.querySelector('.ranking_evaluation') ? firstRow.querySelector('.ranking_evaluation').textContent : 'Not found';
            }
        }
        
        return results;
    });
    
    console.log('\n=== Data Check Results ===');
    console.log(JSON.stringify(dataCheck, null, 2));
    
    // Take a screenshot
    await page.screenshot({ path: 'mouthpiece-test.png', fullPage: true });
    console.log('\nScreenshot saved as mouthpiece-test.png');
    
    await browser.close();
})();