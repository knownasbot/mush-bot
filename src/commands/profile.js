const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const userStats = require("../modules/scraping/userStats");

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
                return interaction.reply("Jogador desconhecido.");
            }
        }

        let description = `Rank: \`${stats.profileInfo.rank}\`\n`;
        description    += `Visto por último: \`${stats.profileInfo.lastSeen}\`\n`;
        description    += `Primeiro login:: \`${stats.profileInfo.firstLogin}\`\n`;

        const embed = new MessageEmbed()
        .setAuthor({
            name: stats.profileInfo.username,
            url: `https://mush.com.br/player/${usernameParam}`,
            iconURL: stats.profileInfo.avatar
        })
        .setColor(0xe83e8c)
        .setDescription(description)
        .setFooter({
            text: "MushMC",
            iconURL: "https://cdn.discordapp.com/attachments/555144973029212171/932998677872672798/favicon.png"
        })
        .setTimestamp();

        for (let minigame of stats.minigamesInfo) {
            let text = "";
            let icon;
            let icons = [
                ["🍄", /hg/i],
                ["⚔️", /pvp|duels/i],
                ["🏹", /sky/i],
                ["🥳", /party/i],
                ["🛏️", /bed/i]
            ];

            for (let stat of minigame.stats) {
                text += `${stat.title}: \`${stat.value}\`\n`;
            }

            for (let test of icons) {
                if (test[1].test(minigame.title)) {
                    icon = test[0] + " ";
                    break;
                }
            }

            embed.addField(icon + minigame.title, text, true);
        }

        return interaction.reply({ embeds: [ embed ] });
    }
}