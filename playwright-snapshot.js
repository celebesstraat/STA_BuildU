const { chromium } = require('playwright');

async function takeSnapshotOfCelticFC() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to Celtic FC website...');
    await page.goto('https://www.celticfc.com', { waitUntil: 'networkidle' });
    
    console.log('Taking screenshot...');
    await page.screenshot({ 
      path: 'celtic-fc-snapshot.png', 
      fullPage: true 
    });
    
    console.log('Snapshot saved as celtic-fc-snapshot.png');
    
    // Get page title and URL for confirmation
    const title = await page.title();
    const url = page.url();
    
    console.log(`Page title: ${title}`);
    console.log(`Page URL: ${url}`);
    
  } catch (error) {
    console.error('Error taking snapshot:', error);
  } finally {
    await browser.close();
  }
}

takeSnapshotOfCelticFC();