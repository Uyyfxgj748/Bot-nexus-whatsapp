const axios = require('axios');

const SFW_ACCIONES = {
    abrazar: { url: 'https://nekos.life/api/v2/img/hug', emoji: '🤗', mensaje: 'abrazó a' },
    besar: { url: 'https://nekos.life/api/v2/img/kiss', emoji: '💋', mensaje: 'besó a' },
    golpear: { url: 'https://nekos.life/api/v2/img/slap', emoji: '👋', mensaje: 'golpeó a' },
    acariciar: { url: 'https://nekos.life/api/v2/img/pat', emoji: '🥰', mensaje: 'acarició a' },
    bailar: { url: 'https://nekos.life/api/v2/img/dance', emoji: '💃', mensaje: 'bailó con' }
};

const NSFW_URLS = {
    neko: 'https://nekos.life/api/v2/img/lewd',
    waifu: 'https://nekos.life/api/v2/img/waifu',
    hentai: 'https://nekos.life/api/v2/img/ero'
};

async function obtenerGif(url) {
    const res = await axios.get(url);
    return res.data.url;
}

async function cmdInteraccion(sock, jid, senderJid, accion, mencionados) {
    const config = SFW_ACCIONES[accion];
    if (!config) return;

    try {
        const gifUrl = await obtenerGif(config.url);
        const senderNum = senderJid.split('@')[0];
        let texto;

        if (mencionados && mencionados.length > 0) {
            const destinoNum = mencionados[0].split('@')[0];
            texto = `${config.emoji} *@${senderNum}* ${config.mensaje} *@${destinoNum}*`;
        } else {
            texto = `${config.emoji} *@${senderNum}* ${config.mensaje} todos 😄`;
        }

        await sock.sendMessage(jid, {
            image: { url: gifUrl },
            caption: texto,
            mentions: mencionados || []
        });
    } catch (err) {
        await sock.sendMessage(jid, { text: '❌ No pude cargar la imagen. Intenta de nuevo.' });
    }
}

async function cmdNsfw(sock, jid, tipo) {
    const url = NSFW_URLS[tipo];
    if (!url) return;

    try {
        const imgUrl = await obtenerGif(url);
        await sock.sendMessage(jid, {
            image: { url: imgUrl },
            caption: `🔞 *${tipo.toUpperCase()}*`
        });
    } catch (err) {
        await sock.sendMessage(jid, { text: '❌ No pude cargar la imagen. Intenta de nuevo.' });
    }
}

module.exports = { cmdInteraccion, cmdNsfw };
