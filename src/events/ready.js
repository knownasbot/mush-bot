const { Client } = require("discord.js");
const commandHandler = require("../handlers/commandHandler");

module.exports = {
    name: "ready",

    /**
     * @param {Client} client
     */
    run: (client) => {
        console.log("Bot conectado ao Discord!");

        commandHandler(client);
    }
}