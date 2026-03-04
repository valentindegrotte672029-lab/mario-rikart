const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to app...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    // Type username to get past splash screen if needed
    try {
        const input = await page.$('.pseudo-input');
        if (input) {
            console.log('Found splash screen, typing pseudo...');
            await input.type('TestUser');
            await page.click('.login-btn');
            await page.waitForTimeout(1000);
        }
    } catch (e) { }

    console.log('Clicking on an app in PageHome...');
    try {
        await page.waitForSelector('.app-icon-container', { timeout: 2000 });
        const apps = await page.$$('.app-icon-container');
        if (apps.length > 0) {
            await apps[0].click();
            console.log('Clicked app!');
            await page.waitForTimeout(2000);
        } else {
            console.log('No apps found!');
        }
    } catch (e) {
        console.log('Error clicking app:', e.message);
    }

    console.log('Done capturing.');
    await browser.close();
})();
