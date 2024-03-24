const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v10');
const config = require('../../config');
const twitchDb = require('../../db/twitchDb');

const log = require('../../utils/log')('Twitch Remove Command');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription('Remove a Twitch streamer')
        .addStringOption(option => 
            option.setName('streamer')
                .setDescription('The name of the streamer')
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Select the channel notifications were sent to')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
    async execute(interaction) {
        const hasRole = interaction.member.roles.cache.has(config.adminId);
        if (!hasRole) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const streamerName = interaction.options.getString('streamer');
        const channel = interaction.options.getChannel('channel');
        
        try {
            await twitchDb.remove(streamerName, channel.id);
            await interaction.reply({ content: `Streamer ${streamerName} removed from notifications in ${channel.name}.`, ephemeral: true });
        } catch (error) {
            log.add(`Error removing twitch user: $(error)`, 500, 5);
            await interaction.reply({ content: `Failed to remove the streamer: ${streamerName}.`, ephemeral: true });
        }
    },
};
