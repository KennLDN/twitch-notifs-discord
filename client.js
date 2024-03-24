const { Client, GatewayIntentBits } = require('discord.js');
const { botToken } = require('./config');
const interactionCreateHandler = require('./utils/interactionCreate');

const log = require('./utils/log')('Client');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.once('ready', () => {
    log.add('Logged in successfully', 200, 1);
});

client.on(interactionCreateHandler.name, interactionCreateHandler.execute);

client.login(botToken);

module.exports = { client };