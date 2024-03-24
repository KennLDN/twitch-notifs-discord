const { SlashCommandBuilder } = require('@discordjs/builders');
const stopCommand = require('./stop').data;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin only commands.')
        .addSubcommand(stopCommand),
};
