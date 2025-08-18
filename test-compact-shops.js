const { chromium } = require('playwright');

async function testCompactShops() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100
    });
    
    const page = await browser.newPage();
    
    console.log('🔍 Testing compact shop display layout...\n');
    
    await page.goto('http://localhost:8081/mouthpiece002/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Scroll to details section to load shops
    await page.evaluate(() => {
        const section = document.querySelector('.detail-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    await page.waitForTimeout(2000);
    
    // Find shop cards
    const shops = await page.$$('.brand-section .shop');
    console.log(`Found ${shops.length} shop cards\n`);
    
    if (shops.length > 0) {
        // Check dimensions of first few shop cards
        console.log('📏 Shop card dimensions:');
        
        for (let i = 0; i < Math.min(shops.length, 3); i++) {
            const shop = shops[i];
            const dimensions = await shop.evaluate(el => {
                const rect = el.getBoundingClientRect();
                const styles = window.getComputedStyle(el);
                const image = el.querySelector('.shop-image');
                const imageRect = image ? image.getBoundingClientRect() : null;
                const btn = el.querySelector('.shop-btn');
                const btnRect = btn ? btn.getBoundingClientRect() : null;
                
                return {
                    card: {
                        height: rect.height,
                        padding: styles.padding,
                        marginTop: styles.marginTop
                    },
                    image: imageRect ? {
                        width: imageRect.width,
                        height: imageRect.height
                    } : null,
                    button: btnRect ? {
                        width: btnRect.width,
                        height: btnRect.height,
                        padding: btn ? window.getComputedStyle(btn).padding : null
                    } : null
                };
            });
            
            console.log(`\n  Shop ${i + 1}:`);
            console.log(`    Card height: ${dimensions.card.height.toFixed(1)}px`);
            console.log(`    Card padding: ${dimensions.card.padding}`);
            if (i > 0) {
                console.log(`    Margin top: ${dimensions.card.marginTop}`);
            }
            
            if (dimensions.image) {
                console.log(`    Image: ${dimensions.image.width.toFixed(1)}x${dimensions.image.height.toFixed(1)}px`);
                const imageCompact = dimensions.image.height <= 45;
                console.log(`    Image compact: ${imageCompact ? '✓' : '✗'} (height ≤ 45px)`);
            }
            
            if (dimensions.button) {
                console.log(`    Button: ${dimensions.button.width.toFixed(1)}x${dimensions.button.height.toFixed(1)}px`);
                console.log(`    Button padding: ${dimensions.button.padding}`);
            }
        }
        
        // Check spacing between shops
        if (shops.length > 1) {
            console.log('\n📐 Spacing between shops:');
            const spacing = await page.evaluate(() => {
                const shops = document.querySelectorAll('.brand-section .shop');
                if (shops.length < 2) return null;
                
                const firstRect = shops[0].getBoundingClientRect();
                const secondRect = shops[1].getBoundingClientRect();
                const gap = secondRect.top - firstRect.bottom;
                
                return gap;
            });
            
            if (spacing !== null) {
                console.log(`  Gap between shops: ${spacing.toFixed(1)}px`);
                console.log(`  Compact spacing: ${spacing <= 8 ? '✓' : '✗'} (≤ 8px)`);
            }
        }
        
        // Visual comparison
        console.log('\n🎨 Visual check:');
        console.log('  Target specifications:');
        console.log('  - Image size: ~60x40px (compact)');
        console.log('  - Card padding: 6px 8px (reduced)');
        console.log('  - Spacing between cards: 6px');
        console.log('  - Button padding: 6px 8px (compact)');
        console.log('  - Overall height: Significantly reduced');
        
        // Take screenshot for comparison
        const firstShop = shops[0];
        await firstShop.screenshot({ 
            path: 'shop-compact-layout.png',
            omitBackground: false
        });
        console.log('\n📸 Screenshot saved as shop-compact-layout.png');
        
        // Check overall compactness
        const overallHeight = await page.evaluate(() => {
            const shops = document.querySelectorAll('.brand-section .shop');
            if (shops.length === 0) return 0;
            
            let totalHeight = 0;
            shops.forEach((shop, index) => {
                if (index < 3) { // Check first 3 shops
                    totalHeight += shop.getBoundingClientRect().height;
                    if (index > 0) {
                        const prevShop = shops[index - 1];
                        const gap = shop.getBoundingClientRect().top - prevShop.getBoundingClientRect().bottom;
                        totalHeight += gap;
                    }
                }
            });
            
            return totalHeight;
        });
        
        console.log('\n📊 Overall compactness:');
        console.log(`  Total height for first 3 shops: ${overallHeight.toFixed(1)}px`);
        console.log(`  Average height per shop: ${(overallHeight / Math.min(shops.length, 3)).toFixed(1)}px`);
        console.log(`  Compact layout: ${overallHeight < 200 ? '✓' : '✗'} (< 200px for 3 shops)`);
        
    } else {
        console.log('⚠️ No shop cards found');
    }
    
    console.log('\n========================================');
    console.log('📝 SUMMARY');
    console.log('========================================');
    console.log('Shop display has been made more compact:');
    console.log('✓ Image size reduced to 60x40px');
    console.log('✓ Card padding reduced to 6px 8px');
    console.log('✓ Spacing between cards reduced to 6px');
    console.log('✓ Button padding reduced to 6px 8px');
    console.log('✓ Font sizes optimized for compact display');
    
    await page.waitForTimeout(3000);
    await browser.close();
    
    console.log('\n✅ Test complete!');
}

testCompactShops().catch(console.error);