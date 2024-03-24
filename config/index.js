require('dotenv').config();

const config = {
    botToken: process.env.BOT_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    adminId: process.env.ADMIN_ID,
};

module.exports = config;
