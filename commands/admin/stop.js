const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const config = require('../../config');
const log = require('../../utils/log')('Application Stop Command');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('stop')
        .setDescription('Stop the application. Will restart automatically if configured correctly.'),
    async execute(interaction) {
        const hasRole = interaction.member.roles.cache.has(config.adminId);
        if (!hasRole) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        await interaction.reply({ content: 'The application is stopping. It will restart automatically if configured properly.', ephemeral: true })
            .then(() => {
                log.add('Application stop command issued.', 500, 5);
                setTimeout(() => process.exit(1), 1000);
            })
            .catch(error => {
                log.add(`Error executing stop command: ${error}`, 500, 5);
            });
    },
};
