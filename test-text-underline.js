const { chromium } = require('playwright');

async function testTextUnderline() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 200
    });
    
    const page = await browser.newPage();
    
    console.log('🔍 Testing underline on text only (not on arrow)...\n');
    
    await page.goto('http://localhost:8081/mouthpiece002/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Scroll to ranking section
    await page.evaluate(() => {
        const section = document.querySelector('.ranking-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    await page.waitForTimeout(2000);
    
    // Find all more buttons
    const moreButtons = await page.$$('.more-button');
    console.log(`Found ${moreButtons.length} buttons\n`);
    
    if (moreButtons.length > 0) {
        // Check text span and arrow separately
        console.log('📝 Checking underline on text span vs arrow:');
        
        for (let i = 0; i < Math.min(moreButtons.length, 2); i++) {
            const button = moreButtons[i];
            const buttonInfo = await button.evaluate(btn => {
                const buttonStyles = window.getComputedStyle(btn);
                const textSpan = btn.querySelector('.button-text');
                const afterStyles = window.getComputedStyle(btn, '::after');
                
                let textSpanInfo = null;
                if (textSpan) {
                    const spanStyles = window.getComputedStyle(textSpan);
                    textSpanInfo = {
                        text: textSpan.textContent,
                        textDecoration: spanStyles.textDecoration,
                        hasUnderline: spanStyles.textDecoration.includes('underline')
                    };
                }
                
                return {
                    fullText: btn.textContent,
                    buttonTextDecoration: buttonStyles.textDecoration,
                    buttonHasUnderline: buttonStyles.textDecoration.includes('underline'),
                    textSpan: textSpanInfo,
                    afterContent: afterStyles.content,
                    afterTextDecoration: afterStyles.textDecoration,
                    innerHTML: btn.innerHTML
                };
            });
            
            console.log(`\n  Button ${i + 1}:`);
            console.log(`    Full text: "${buttonInfo.fullText}"`);
            console.log(`    Button element underline: ${buttonInfo.buttonHasUnderline ? 'Yes' : 'No'}`);
            
            if (buttonInfo.textSpan) {
                console.log(`    Text span found: ✓`);
                console.log(`    Text span content: "${buttonInfo.textSpan.text}"`);
                console.log(`    Text span underline: ${buttonInfo.textSpan.hasUnderline ? '✓' : '✗'} (${buttonInfo.textSpan.textDecoration})`);
            } else {
                console.log(`    Text span found: ✗`);
            }
            
            console.log(`    Arrow (::after) content: ${buttonInfo.afterContent}`);
            console.log(`    Arrow underline: ${buttonInfo.afterTextDecoration}`);
            console.log(`    HTML structure: ${buttonInfo.innerHTML.substring(0, 100)}...`);
        }
        
        // Visual check
        console.log('\n🎨 Visual verification:');
        console.log('  Expected appearance:');
        console.log('  - Text "他●件のクリニックを見る" should have underline');
        console.log('  - Arrow "▼" should NOT have underline');
        console.log('  - Both should be gray color (#9e9e9e)');
        
        // Take screenshot
        await moreButtons[0].screenshot({ 
            path: 'button-text-underline.png',
            omitBackground: false
        });
        console.log('\n📸 Screenshot saved as button-text-underline.png');
        
    } else {
        console.log('⚠️ No buttons found to test');
    }
    
    await page.waitForTimeout(3000);
    await browser.close();
    
    console.log('\n✅ Test complete!');
}

testTextUnderline().catch(console.error);