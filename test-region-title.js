const { chromium } = require('playwright');

async function testRegionTitle() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 200
    });
    
    const page = await browser.newPage();
    
    console.log('🔍 Testing region name display and subtitle...\n');
    
    await page.goto('http://localhost:8081/mouthpiece002/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check initial state
    const initialState = await page.evaluate(() => {
        const regionNameElement = document.getElementById('comparison-region-name');
        const subtitleElement = document.querySelector('.comparison-subtitle');
        
        return {
            regionName: regionNameElement ? regionNameElement.textContent : 'Not found',
            subtitle: subtitleElement ? subtitleElement.innerHTML : 'Not found',
            subtitleText: subtitleElement ? subtitleElement.textContent : 'Not found'
        };
    });
    
    console.log('Initial state:');
    console.log(`  Region name: "${initialState.regionName}"`);
    console.log(`  Subtitle HTML: ${initialState.subtitle}`);
    console.log(`  Subtitle text: "${initialState.subtitleText}"`);
    
    // Scroll to comparison section
    await page.evaluate(() => {
        const section = document.querySelector('.comparison-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(1000);
    
    // Test region switching
    console.log('\n🔄 Testing region switching...');
    
    // Try to change region
    const regionSelect = await page.$('#region-select');
    if (regionSelect) {
        // Select Osaka (027)
        await page.selectOption('#region-select', '027');
        await page.waitForTimeout(1000);
        
        const afterOsaka = await page.evaluate(() => {
            const regionNameElement = document.getElementById('comparison-region-name');
            return regionNameElement ? regionNameElement.textContent : 'Not found';
        });
        
        console.log(`  After selecting Osaka: "${afterOsaka}"`);
        
        // Select Tokyo (013)
        await page.selectOption('#region-select', '013');
        await page.waitForTimeout(1000);
        
        const afterTokyo = await page.evaluate(() => {
            const regionNameElement = document.getElementById('comparison-region-name');
            return regionNameElement ? regionNameElement.textContent : 'Not found';
        });
        
        console.log(`  After selecting Tokyo: "${afterTokyo}"`);
    } else {
        console.log('  ⚠️ Region selector not found');
    }
    
    // Final check
    const finalState = await page.evaluate(() => {
        const regionNameElement = document.getElementById('comparison-region-name');
        const subtitleElement = document.querySelector('.comparison-subtitle');
        const accentSpan = subtitleElement ? subtitleElement.querySelector('.accent-text') : null;
        
        return {
            regionName: regionNameElement ? regionNameElement.textContent : 'Not found',
            subtitleCorrect: subtitleElement && subtitleElement.textContent === 'クリニックを徹底比較',
            hasAccentSpan: !!accentSpan,
            accentText: accentSpan ? accentSpan.textContent : 'Not found'
        };
    });
    
    console.log('\n📊 Final verification:');
    console.log(`  Region name displayed: ${finalState.regionName !== 'Not found' ? '✓' : '✗'} "${finalState.regionName}"`);
    console.log(`  Subtitle correct: ${finalState.subtitleCorrect ? '✓' : '✗'}`);
    console.log(`  Has accent span: ${finalState.hasAccentSpan ? '✓' : '✗'}`);
    console.log(`  Accent text: "${finalState.accentText}"`);
    
    if (finalState.regionName !== 'Not found' && 
        finalState.subtitleCorrect && 
        finalState.hasAccentSpan && 
        finalState.accentText === '徹底比較') {
        console.log('\n✅ All checks passed!');
    } else {
        console.log('\n⚠️ Some issues remain');
    }
    
    await page.waitForTimeout(5000);
    await browser.close();
}

testRegionTitle();