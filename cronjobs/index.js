const cron = require('node-cron');
const checkTwitch = require('./checkTwitch');
const log = require('../utils/log')('Cronjobs');

function setupCronJobs() {
    cron.schedule('* * * * *', checkTwitch);
    log.add(`Cronjobs Successfully enabled`, 200, 1);
}

module.exports = setupCronJobs;
