require("dotenv").config();

const { Client, Collection, Intents } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");

const client = new Client({
    intents: [ Intents.FLAGS.GUILDS ]
});

client.commands = new Collection();

eventHandler(client);

client.login(process.env.BOT_TOKEN);