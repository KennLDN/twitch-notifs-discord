const https = require('https');

const log = require('../log')('Twitch Live Check');

function isLive(channelName) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'www.twitch.tv',
            path: `/${channelName}`,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        };

        https.get(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (data.includes('isLiveBroadcast":true')) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        }).on('error', (e) => {
            log.add(`Got error: ${e.message}`, 500, 2);
            reject(e);
        });
    });
}

module.exports = isLive;
