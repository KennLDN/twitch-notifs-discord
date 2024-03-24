# Twitch Notification Discord Bot

This is a simple discord bot that lets you setup automated notifications when a twitch streamer goes live. You can set the channel and a role to mention, and setup multiple rules.

*NOTE: This bot uses puppeteer to gather data rather than the twitch API. While this means you do not need to provide a twitch API key, it also means it has a higher chance of breaking, and is a fair bit more resource-intensive.*

### Running

For best results, please use the docker compose included. You can run the application directly, however the /admin stop command will not restart the server, and you must manually install all puppeteer dependencies.

1. Rename .env.example to .env and fill out the fields.

2. `git clone https://github.com/kennldn/twitch-notifs-discord.git`

3. `cd twitch-notifs-discord && docker-compose up --build`