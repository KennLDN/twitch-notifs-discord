const fs = require('fs');
const path = require('path');
const log = require('../utils/log')('Twitch Live Database Manager');

const dbPath = path.join(__dirname, 'store', 'twitchLive.json');

function readDb() {
    return new Promise((resolve, reject) => {
        fs.readFile(dbPath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.writeFile(dbPath, JSON.stringify({}, null, 2), 'utf8', (writeErr) => {
                        if (writeErr) {
                            reject(writeErr);
                            return;
                        }
                        resolve({});
                    });
                } else {
                    reject(err);
                }
                return;
            }
            try {
                resolve(JSON.parse(data));
            } catch (error) {
                reject(error);
            }
        });
    });
}

function writeDb(data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

const streamerStatusDb = {
    async updateStatus(username, wasLive, lastLiveTimestamp, lastOfflineTimestamp) {
        const data = await readDb();
        if (!data[username]) {
            data[username] = { wasLive, lastLiveTimestamp, lastOfflineTimestamp };
        } else {
            data[username].wasLive = wasLive;
            if (lastLiveTimestamp) data[username].lastLiveTimestamp = lastLiveTimestamp;
            if (lastOfflineTimestamp) data[username].lastOfflineTimestamp = lastOfflineTimestamp;
        }
        await writeDb(data);
    },

    async getStatus(username) {
        const data = await readDb();
        if (!data[username]) {
            return { wasLive: false, lastLiveTimestamp: null, lastOfflineTimestamp: null };
        }
        return data[username];
    }
};

module.exports = streamerStatusDb;
