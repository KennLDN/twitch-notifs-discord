const { client } = require('../client');
const log = require('./log')('Embed Sender');

async function sendEmbed(embedData, channelId) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) throw new Error('Channel not found');

        await channel.send({ 
            content: embedData.content,
            embeds: embedData.embeds, 
            components: embedData.components 
        });
    } catch (error) {
        log.add(`Failed to send embed: ${error}`, 500, 5);
    }
}

module.exports = sendEmbed;
