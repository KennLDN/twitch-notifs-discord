const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v10');
const config = require('../../config');
const twitchDb = require('../../db/twitchDb');

const log = require('../../utils/log')('Twitch Add Command');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Add a Twitch streamer')
        .addStringOption(option => 
            option.setName('streamer')
                .setDescription('The name of the streamer')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select the channel where notifications will be sent')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Select a role to notify')
                .setRequired(false)),
    async execute(interaction) {
        const hasRole = interaction.member.roles.cache.has(config.adminId);
        if (!hasRole) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const streamerName = interaction.options.getString('streamer');
        const selectedChannel = interaction.options.getChannel('channel');
        const selectedRole = interaction.options.getRole('role');

        try {
            await twitchDb.add(streamerName, selectedChannel.id, selectedRole ? selectedRole.id : null);
            await interaction.reply({ content: `Streamer ${streamerName} added, notifications will be sent to ${selectedChannel.name}${selectedRole ? ' for role ' + selectedRole.name : ''}.`, ephemeral: true });
        } catch (error) {
            log.add(`Error adding twitch user: ${error}`, 500, 5);
            await interaction.reply({ content: 'Failed to add the Twitch streamer.', ephemeral: true });
        }
    },
};
