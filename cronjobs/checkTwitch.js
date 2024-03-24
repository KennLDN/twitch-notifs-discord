const fs = require('fs');
const path = require('path');
const isLive = require('../utils/twitch/isLive');
const getInfo = require('../utils/twitch/getInfo');
const sendEmbed = require('../utils/sendEmbed');
const log = require('../utils/log')('Twitch Check Cronjob');
const twitchLiveDb = require('../db/twitchLiveDb');

const dbPath = path.join(__dirname, '..', 'db', 'store', 'twitch.json');
let streamersQueue = [];

async function loadStreamers() {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        const jsonData = JSON.parse(data);
        streamersQueue = [];
        for (const [username, details] of Object.entries(jsonData)) {
            for (const { channelId, roleId } of details) {
                const { wasLive, lastLiveTimestamp, lastOfflineTimestamp } = await twitchLiveDb.getStatus(username);
                streamersQueue.push({ username, channelId, roleId, wasLive, lastLiveTimestamp, lastOfflineTimestamp });
            }
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            fs.writeFileSync(dbPath, JSON.stringify({}));
            log.add('twitch.json did not exist, so it was created.', 102, 2);
        } else {
            log.add(`Failed to parse streamers database: ${error}`, 500, 5);
        }
    }
}

function setupFileWatcher() {
    fs.access(dbPath, fs.constants.F_OK, (err) => {
        if (err) {
            log.add(`${dbPath} does not exist. File watcher not set up.`, 404, 1);
            return;
        }

        fs.watch(dbPath, (eventType, filename) => {
            if (filename) {
                log.add(`Detected ${eventType} in ${filename}, reloading streamers data...`, 102, 2);
                loadStreamers();
            }
        });
    });
}

async function checkTwitch() {
    if (!streamersQueue.length) {
        log.add(`No entries.`, 404, 1);
        return;
    }

    for (const streamer of streamersQueue) {
        const currentTime = new Date().getTime();

        try {
            const isLiveStatus = await isLive(streamer.username);
            const timeSinceLastOffline = currentTime - (streamer.lastOfflineTimestamp || 0);
            
            if (isLiveStatus) {
                await twitchLiveDb.updateStatus(streamer.username, true, currentTime, streamer.lastOfflineTimestamp);
                
                if (!streamer.wasLive) {
                    if (streamer.lastOfflineTimestamp === null || timeSinceLastOffline >= 3600000) {
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
                    } else {
                        log.add(`${streamer.username} went live within an hour of going offline. Skipping embed.`, 102, 2);
                    }
                }
            } else if (!isLiveStatus && streamer.wasLive) {
                log.add(`${streamer.username} is no longer live`, 200, 1);
                await twitchLiveDb.updateStatus(streamer.username, false, streamer.lastLiveTimestamp, currentTime);
            }
        } catch (error) {
            log.add(`Error checking live status for ${streamer.username}: ${error}`, 500, 5);
        }
    }

    await loadStreamers();
}

loadStreamers();
setupFileWatcher();

module.exports = checkTwitch;
