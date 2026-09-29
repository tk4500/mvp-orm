
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        messages = []
        page.on("console", lambda msg: messages.append(f"[{msg.type}] {msg.text}"))
        
        await page.goto('http://localhost:8402/')
        await page.evaluate('''() => {
            document.title = '[Human]';
            const script = document.createElement('script');
            script.src = 'http://localhost:8402/detect.js';
            document.head.appendChild(script);
        }''')
        
        await page.wait_for_timeout(3000)
        print("MESSAGES:", messages)
        await browser.close()

asyncio.run(main())
