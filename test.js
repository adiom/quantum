const { chromium } = require('playwright');
const path = require('path');

async function testGame() {
    console.log('Starting game test...');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Collect console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    page.on('pageerror', err => {
        errors.push(err.message);
    });

    // Load the game
    const filePath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${filePath}`);

    console.log('Page loaded, waiting for initialization...');

    // Wait for loading screen to finish
    await page.waitForTimeout(2500);

    // Check if menu is visible
    const menuVisible = await page.isVisible('#menu-screen');
    console.log('Menu screen visible:', menuVisible);

    // Click start button
    console.log('Clicking Start Game button...');
    await page.click('#start-btn');

    // Wait for game to start
    await page.waitForTimeout(1000);

    // Check if game screen is visible
    const gameVisible = await page.isVisible('#game-screen');
    console.log('Game screen visible:', gameVisible);

    // Check if player hand has cards
    const handCards = await page.locator('#player-hand .card').count();
    console.log('Player hand cards:', handCards);

    // Check if player HP is displayed
    const playerHP = await page.textContent('#player-hp');
    console.log('Player HP:', playerHP);

    // Check if mana is displayed
    const manaText = await page.textContent('#player-mana-text');
    console.log('Player mana:', manaText);

    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(2000);

    // Report results
    console.log('\n=== TEST RESULTS ===');
    if (errors.length > 0) {
        console.log('ERRORS FOUND:');
        errors.forEach(err => console.log(' - ' + err));
    } else {
        console.log('No console errors detected!');
    }
    console.log('Test completed successfully!');

    await browser.close();
}

testGame().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
