const fs = require('fs');
const path = require('path');
const isLive = require('../utils/twitch/isLive');
const getInfo = require('../utils/twitch/getInfo');
const sendEmbed = require('../utils/sendEmbed');
const log = require('../utils/log')('Twitch Check Cronjob');

const dbPath = path.join(__dirname, '..', 'db', 'store', 'twitch.json');
let streamersQueue = [];

function loadStreamers() {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read streamers database:', err);
            return;
        }
        try {
            const jsonData = JSON.parse(data);
            streamersQueue = [];
            Object.entries(jsonData).forEach(([username, details]) => {
                details.forEach(({ channelId, roleId }) => {
                    streamersQueue.push({ username, channelId, roleId, wasLive: false });
                });
            });
        } catch (error) {
            log.add(`Failed to parse streamers database: ${error}`, 500, 5);
        }
    });
}

fs.watch(dbPath, (eventType, filename) => {
    if (filename) {
        log.add(`Detected ${eventType} in ${filename}, reloading streamers data...`, 102, 2);
        loadStreamers();
    }
});

async function checkTwitch() {
    if (!streamersQueue.length) {
        log.add(`No entries.`, 404, 1)
        return;
    }

    const streamer = streamersQueue.shift();

    isLive(streamer.username).then(async (isLiveStatus) => {
        if (isLiveStatus && !streamer.wasLive) {
            log.add(`${streamer.username} is live! Processing...`, 102, 2);
            const info = await getInfo(streamer.username);
            const embedData = {
                content: streamer.roleId ? `<@&${streamer.roleId}>` : "",
                tts: false,
                embeds: [
                    {
                        description: "",
                        author: {
                            name: `${streamer.username} is live!`,
                            url: `https://twitch.tv/${streamer.username}`,
                            icon_url: info.avatar
                        },
                        title: info.streamName,
                        timestamp: new Date().toISOString(),
                        thumbnail: {
                            url: info.gameUrl
                        },
                        footer: {
                            text: info.game
                        }
                    }
                ],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 5,
                                label: "Watch Now",
                                url: `https://twitch.tv/${streamer.username}`
                            }
                        ]
                    }
                ]
            };

            await sendEmbed(embedData, streamer.channelId);
            log.add(`Embed sent for ${streamer.username} going live`, 200, 1);
        } else if (!isLiveStatus && streamer.wasLive) {
            log.add(`${streamer.username} is no longer live`, 200, 1);
        }
        streamer.wasLive = isLiveStatus;
    }).catch(error => {
        log.add(`Other error: ${error}`, 500, 5);
    });

    streamersQueue.push(streamer);
}

loadStreamers();

module.exports = checkTwitch;
