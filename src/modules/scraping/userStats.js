const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Coleta e retorna dados de minigame do jogador.
 * @param {string} user Usuário a ser checado.
 * @returns {Promise<object>}
 */
module.exports = async (user) => {
    let data = {};

    let res = await axios.get(`https://mush.com.br/player/${user}`);
    let $ = cheerio.load(res.data);
    
    let username = $("h1.username").text();
    if (!username) {
        throw new Error("Jogador inválido.");
    }

    let profileInfo = $(".profile-info > table > tbody > tr");
    data.profileInfo = {
        avatar: $("img.picture")[0].attribs.src,
        username,
        rank: profileInfo[0].children[3].children[0].data,
        lastSeen: profileInfo[1].children[3].children[0].data,
        firstLogin: profileInfo[2].children[3].children[0].data
    }

    let minigamesInfo = $(".profile-game > .card-profile-game");
    data.minigamesInfo = [];

    for (let node of minigamesInfo) {
        node = cheerio.load(node);

        let info = {
            title: node(".title")[0].children[0].data,
            thumb: node("img")[0].attribs.src,
            stats: []
        }

        let stats = node(".stat-entry");
        for (let stat of stats) {
            stat = cheerio.load(stat);

            info.stats.push({
                title: stat(".stat-title")[0].children[0].data,
                value: stat(".stat-value")[0].children[0].data
            });
        }

        data.minigamesInfo.push(info);
    }

    return data;
}