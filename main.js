const setupCronJobs = require('./cronjobs');
setupCronJobs();

require('./utils/registerCommands');
require('./client');