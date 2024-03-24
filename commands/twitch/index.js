const { SlashCommandBuilder } = require('@discordjs/builders');
const addCommand = require('./add').data;
const removeCommand = require('./remove').data;
const listCommand = require('./list').data;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('twitch')
        .setDescription('Commands related to Twitch Notifications')
        .addSubcommand(addCommand)
        .addSubcommand(removeCommand)
        .addSubcommand(listCommand),
};
