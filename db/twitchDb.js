const fs = require('fs');
const path = require('path');
const log = require('../utils/log')('Twitch Database Manager');

const dbPath = path.join(__dirname, 'store', 'twitch.json');

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

const db = {
    async add(username, channelId, roleId = null) {
        const data = await readDb();
        if (!data[username]) {
            data[username] = [];
        }
        const existingEntry = data[username].find(entry => entry.channelId === channelId);
        if (!existingEntry) {
            data[username].push({ channelId, roleId });
        } else if (roleId && existingEntry.roleId !== roleId) {
            existingEntry.roleId = roleId;
        }
        await writeDb(data);
    },

    async remove(username, channelId) {
        const data = await readDb();
        if (!data[username]) {
            log.add(`No entry found for username: ${username}`, 404, 5);
            return;
        }
        const channelIndex = data[username].findIndex(entry => entry.channelId === channelId);
        if (channelIndex === -1) {
            log.add(`No channel ID matches found for username: ${username}`, 404, 5);
            return;
        }
        data[username].splice(channelIndex, 1);
        if (data[username].length === 0) {
            delete data[username];
        }
        await writeDb(data);
    },    

    async list() {
        return await readDb();
    }
};

module.exports = db;