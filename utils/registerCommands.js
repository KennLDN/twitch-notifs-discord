const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const { botToken, clientId, guildId } = require('../config');

const log = require('./log')('Register Commands');

const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');

const readCommands = dir => {
    const commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));

    if (dir === commandsPath) {
        for (const file of commandFiles) {
            const command = require(path.join(dir, file));
            commands.push(command.data.toJSON());
        }
    } else {
        if (commandFiles.includes('index.js')) {
            const command = require(path.join(dir, 'index.js'));
            commands.push(command.data.toJSON());
        }
    }

    const subdirs = fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isDirectory());
    for (const subdir of subdirs) {
        readCommands(path.join(dir, subdir));
    }
};

readCommands(commandsPath);

const rest = new REST({ version: '9' }).setToken(botToken);

(async () => {
    try {
        log.add('Started refreshing application (/) commands.', 102, 1);
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        log.add('Successfully refreshed application (/) commands.', 200, 1);
    } catch (error) {
        log.add(`Error refreshing application (/) commands: $(error)`, 500, 5);
    }
})();
