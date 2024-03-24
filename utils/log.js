const fs = require('fs');
const path = require('path');

module.exports = (processName) => {
    return {
        add: (msg, status, priority) => {
            const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            const logMessage = `[${timestamp}][${processName}][${status}][${priority}]: ${msg}`;
            console.log(logMessage);

            const logFilePath = path.join(__dirname, '..', 'log.txt');
            fs.appendFile(logFilePath, logMessage + '\n', (err) => {
                if (err) throw err;
            });
        },
    };
};
