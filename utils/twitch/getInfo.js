const puppeteer = require('puppeteer');
const log = require('../log')('Retrieve Channel Info');

async function getInfo(username) {
    let browser = null;

    try {
        log.add(`Running Puppeteer for info`, 200, 2);
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');

        await page.goto(`https://twitch.tv/${username}`, { waitUntil: 'networkidle0' });

        const avatarSelector = `.tw-avatar img[alt="${username}" i]`;
        const avatar = await page.$eval(avatarSelector, img => img.src).catch(() => null);        
        const streamName = await page.$eval('h2[data-a-target="stream-title"]', h2 => h2.innerText).catch(() => null);
        const game = await page.$eval('a[data-a-target="stream-game-link"] span', span => span.innerText).catch(() => null);

        let gameUrl = null;
        if (game) {
            const formattedGameName = game.replace(/&/g, 'and').replace(/ /g, '-').toLowerCase();
            const gamePageUrl = `https://www.twitch.tv/directory/category/${formattedGameName}`;
            await page.goto(gamePageUrl, { waitUntil: 'networkidle0' });
            const gameImgSelector = `.tw-image[alt="${game}"]`;
            gameUrl = await page.$eval(gameImgSelector, img => img.src).catch(() => null);
        }

        return { avatar, streamName, game, gameUrl };
    } catch (error) {
        log.add(`Failed to retrieve Twitch info: ${error}`, 500, 5);
        throw error; 
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = getInfo;
