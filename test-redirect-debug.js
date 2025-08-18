const { chromium } = require('playwright');

(async () => {
  console.log('🔍 リダイレクトページのデバッグ\n');
  
  const browser = await chromium.launch({ headless: false });
  
  try {
    const page = await browser.newPage();
    
    // コンソールログを全てキャプチャ
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    // テストケース: キレイライン矯正（clinic_id=3, rank=2）
    const testUrl = 'http://localhost:3000/mouthpiece002/redirect.html?clinic_id=3&rank=2&region_id=013#params=%7B%22clinic_id%22%3A%223%22%2C%22rank%22%3A2%2C%22region_id%22%3A%22013%22%7D';
    
    console.log('📋 テストURL:', testUrl);
    console.log('  期待される結果: キレイライン矯正のrank=2のURLにリダイレクト\n');
    
    await page.goto(testUrl);
    
    // リダイレクトを待つ（最大5秒）
    await page.waitForTimeout(5000);
    
    const finalUrl = page.url();
    console.log('\n📍 最終URL:', finalUrl);
    
    // リダイレクト先を判定
    if (finalUrl.includes('kireiline') || finalUrl.includes('affiliate-b')) {
      console.log('✅ 正しくキレイライン矯正にリダイレクトされました');
    } else if (finalUrl.includes('ohmyteeth') || finalUrl.includes('a8.net')) {
      console.log('❌ 誤ってOh my teethにリダイレクトされました');
    } else if (finalUrl.includes('redirect.html')) {
      console.log('❌ リダイレクトが実行されませんでした');
    } else {
      console.log('⚠️ 予期しないリダイレクト先');
    }
    
    console.log('\n👀 ブラウザを5秒間開いたままにします...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ エラー:', error);
  } finally {
    await browser.close();
  }
})();