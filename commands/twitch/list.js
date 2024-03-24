const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const twitchDb = require('../../db/twitchDb');
const config = require('../../config');
const log = require('../../utils/log')('Twitch List Command');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription('List all Twitch streamers'),
    async execute(interaction) {
        const hasRole = interaction.member.roles.cache.has(config.adminId);
        if (!hasRole) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        try {
            const dbEntries = await twitchDb.list();
            let replyMessage = 'List of Active Twitch Notifications:\n';

            Object.keys(dbEntries).forEach(streamerName => {
                const entries = dbEntries[streamerName].map(entry => {
                    let channelMention = `<#${entry.channelId}>`;
                    let roleMention = entry.roleId ? `, <@&${entry.roleId}>` : '';
                    return `${channelMention}${roleMention}`;
                }).join('\n  ');

                replyMessage += `**${streamerName}**:\n  ${entries}\n`;
            });

            if (Object.keys(dbEntries).length === 0) {
                replyMessage = 'No Twitch streamers added yet.';
            }

            await interaction.reply({ content: replyMessage, ephemeral: true });
        } catch (error) {
            log.add(`Error listing twitch users: ${error}`, 500, 5);
            await interaction.reply({ content: 'Failed to list Twitch streamers.', ephemeral: true });
        }
    },
};
