const fs = require('fs');
const path = require('path');

const log = require('./log')('Interaction Create');

const commands = new Map();
const commandsPath = path.join(__dirname, '..', 'commands');

function loadCommands(directory, parentPath = '') {
    const commandFiles = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of commandFiles) {
        if (file.isDirectory()) {
            loadCommands(path.join(directory, file.name), path.join(parentPath, file.name));
        } else if (file.name.endsWith('.js')) {
            const filePath = path.join(directory, file.name);
            const command = require(filePath);
            const commandName = parentPath ? `${parentPath}/${command.data.name}` : command.data.name;
            commands.set(commandName, command);
        }
    }
}

loadCommands(commandsPath);

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const commandName = `${interaction.commandName}/${interaction.options.getSubcommand()}`;
        const command = commands.get(commandName);

        if (!command) {
            log.add(`Command not found: ${commandName}`, 500, 1);
            await interaction.reply({ content: 'Command not found!', ephemeral: true });
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            log.add(`Error executing command: ${error}`, 500, 1);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};
