const { Client } = require("discord.js");
const { readdirSync } = require("fs");
const path = require("path");

/**
 * @param {Client} client 
 */
module.exports = (client) => {
    let commandList = readdirSync(path.resolve(__dirname, "../commands"));
    let commandsOptions = [];

    commandList.forEach(file => {
        if (!file.endsWith(".js")) return;

        let fileName = file.split(".")[0];
        
        try {
            let command = require(`../commands/${fileName}`);

            client.commands.set(command.name, command);
            commandsOptions.push({
                name: command.name,
                description: command.description,
                options: command.options
            });
        } catch(e) {
            console.error(`Falha ao carregar o comando ${file}:`, e);
        }
    });

    // Registrar comandos nas guildas (não recomendado caso haja muitas)
    client.guilds.fetch()
    .then(guilds => {
        guilds.forEach(guild => {
            client.application.commands.set(commandsOptions, guild.id)
            .catch(e => console.error(`Falha ao registrar commandos na guilda ${guild.id}:`, e));
        });
    })
    .catch(e => console.error(`Falha ao obter as guildas:`, e));
}