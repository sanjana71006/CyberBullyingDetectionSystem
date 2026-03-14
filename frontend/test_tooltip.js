import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1440, height: 900 });
  
  // Navigate to dashboard
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  
  // Wait for the chart to render
  await page.waitForSelector('.recharts-scatter-symbol');
  
  // Get the bounding box of the first scatter dot
  const dot = await page.$('.recharts-scatter-symbol');
  const box = await dot.boundingBox();
  
  if (box) {
    // Hover over the center of the dot
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    
    // Wait for tooltip to appear
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Take screenshot
    await page.screenshot({ path: 'C:/Users/dashi/.gemini/antigravity/brain/df39924b-f743-4891-b17d-c67c2785a8a7/dashboard_tooltip.png' });
    console.log('Screenshot saved to dashboard_tooltip.png');
  } else {
    console.log('Could not find scatter dot');
  }

  await browser.close();
})();
