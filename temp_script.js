
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const messages = [];
  page.on('console', msg => messages.push(`[${msg.type()}] ${msg.text()}`));
  
  await page.goto('http://localhost:8402/');
  await page.evaluate(() => {
    document.title = '[Human]';
    const script = document.createElement('script');
    script.src = 'http://localhost:8402/detect.js';
    document.head.appendChild(script);
  });
  
  await page.waitForTimeout(3000);
  console.log("MESSAGES:", JSON.stringify(messages));
  await browser.close();
})();
