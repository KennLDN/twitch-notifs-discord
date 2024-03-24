const fs = require('fs');
const path = require('path');

module.exports = (processName) => {
    return {
        add: (msg, status, priority) => {
            const logMessage = `[${processName}][${status}][${priority}]: ${msg}`;
            console.log(logMessage);

            const logFilePath = path.join(__dirname, '..', 'log.txt');
            fs.appendFile(logFilePath, logMessage + '\n', (err) => {
                if (err) throw err;
            });
        },
    };
};
