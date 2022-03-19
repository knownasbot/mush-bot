const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const userStats = require("../modules/api/userStats");

module.exports = {
    name: "perfil",
    description: "Mostra estatísticas de minigames do jogador.",
    options: [
        {
            type: "STRING",
            name: "jogador",
            description: "Nome do jogador a ser verificado.",
            required: true
        }
    ],

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        let usernameParam = interaction.options.getString("jogador")?.toLowerCase();
        if (!usernameParam) return;

        let stats = client.mush.cache.profile.get(usernameParam);
        if (!stats || stats.lastActivity + 5*60*1000 <= Date.now()) {
            try {
                stats = await userStats(usernameParam);
                stats.lastActivity = Date.now();
                client.mush.cache.profile.set(usernameParam, stats);
            } catch(e) {
                return await interaction.reply("Jogador desconhecido.");
            }
        }

        let firstLogin = new Date(stats.first_login).toLocaleString();
        let lastLogin = new Date(stats.last_login).toLocaleString();

        let description = `Rank: **\` ${stats.rank.title ?? "Desconhecido"} \`**\n`;
        description    += `Visto por último: \`${stats.first_login ? lastLogin : "Desconhecido"}\`\n`;
        description    += `Primeiro login: \`${stats.last_login ? firstLogin : "Desconhecido"}\`\n`;

        if (stats.banned) description = "**⚠️ BANIDO ⚠️**\n" + description;

        const embed = new MessageEmbed()
        .setAuthor({
            name: stats.account.username,
            url: `https://mush.com.br/player/${usernameParam}`,
            iconURL: `https://minotar.net/avatar/${usernameParam}`
        })
        .setColor(0xe83e8c)
        .setDescription(description)
        .setFooter({
            text: "MushMC",
            iconURL: "https://cdn.discordapp.com/attachments/555144973029212171/932998677872672798/favicon.png"
        })
        .setTimestamp();

        stats = stats.stats;

        let minigames = [
            {
                title: "🍄 HG",
                text: `Kills: \`${stats.hungergames?.kills ?? 0}\`\n` +
                      `Vitórias: \`${stats.hungergames?.wins ?? 0}\`\n` +
                      `Mortes: \`${stats.hungergames?.deaths ?? 0}\`\n` +
                      `K/D: \`${((stats.hungergames?.kills ?? 0) / (stats.hungergames?.deaths ?? 1)).toFixed(2)}\``
            },
            {
                title: "⚔️ PvP",
                text: `Arena: Kills: \`${stats.pvp?.arena_kills ?? 0}\`\n` +
                      `Arena: Mortes: \`${stats.pvp?.arena_deaths ?? 0}\``
            },
            {
                title: "⚔️ Duels: 1v1",
                text: `Vitórias: \`${stats.duels?.soup_wins ?? 0}\`\n` +
                      `Derrotas: \`${stats.duels?.soup_deaths ?? 0}\`\n` +
                      `Winstreak: \`${stats.duels?.soup_winstreak ?? 0}\``
            },
            {
                title: "🏹 Sky Wars",
                text: `Kills: \`${stats.skywars_r1?.kills ?? 0}\`\n` +
                      `Vitórias: \`${stats.skywars_r1?.wins ?? 0}\`\n` +
                      `Derrotas: \`${stats.skywars_r1?.losses ?? 0}\`\n`
            },
            {
                title: "🥳 Party",
                text: `1º Lugar: \`${stats.party?.first_place ?? 0}\`\n` +
                      `2º Lugar: \`${stats.party?.second_place ?? 0}\`\n` +
                      `3º Lugar: \`${stats.party?.third_place ?? 0}\`\n` +
                      `Pontos: \`${stats.party?.points ?? 0}\``
            },
            {
                title: "🛏️ Bed Wars",
                text: `Vitórias: \`${stats.bedwars?.wins ?? 0}\`\n` +
                      `Kills: \`${stats.bedwars?.kills ?? 0}\`\n` +
                      `Kills Finais: \`${stats.bedwars?.final_kills ?? 0}\`\n`
            }
        ];

        for (let minigame of minigames) {
            embed.addField(minigame.title, minigame.text, true);
        }

        // TODO: selecionar minigame para ver informações detalhadas

        return interaction.reply({ embeds: [ embed ] });
    }
}