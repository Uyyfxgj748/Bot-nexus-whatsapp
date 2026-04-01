const axios = require('axios');

const SFW_ACCIONES = {
    abrazar:    { emoji: '🤗', accion: 'hug',     mensaje: 'abrazó a' },
    hug:        { emoji: '🤗', accion: 'hug',     mensaje: 'abrazó a' },
    besar:      { emoji: '💋', accion: 'kiss',    mensaje: 'besó a' },
    kiss:       { emoji: '💋', accion: 'kiss',    mensaje: 'besó a' },
    golpear:    { emoji: '👋', accion: 'slap',    mensaje: 'golpeó a' },
    slap:       { emoji: '👋', accion: 'slap',    mensaje: 'golpeó a' },
    acariciar:  { emoji: '🥰', accion: 'pat',     mensaje: 'acarició a' },
    pat:        { emoji: '🥰', accion: 'pat',     mensaje: 'acarició a' },
    bailar:     { emoji: '💃', accion: 'dance',   mensaje: 'bailó con' },
    dance:      { emoji: '💃', accion: 'dance',   mensaje: 'bailó con' },
    llorar:     { emoji: '😢', accion: 'cry',     mensaje: 'llora junto a' },
    cry:        { emoji: '😢', accion: 'cry',     mensaje: 'llora junto a' },
    morder:     { emoji: '😬', accion: 'bite',    mensaje: 'mordió a' },
    bite:       { emoji: '😬', accion: 'bite',    mensaje: 'mordió a' },
    sonrojar:   { emoji: '😳', accion: 'blush',   mensaje: 'se sonrojó con' },
    blush:      { emoji: '😳', accion: 'blush',   mensaje: 'se sonrojó con' },
    acurrucar:  { emoji: '🫂', accion: 'cuddle',  mensaje: 'se acurrucó con' },
    cuddle:     { emoji: '🫂', accion: 'cuddle',  mensaje: 'se acurrucó con' },
    picar:      { emoji: '👉', accion: 'poke',    mensaje: 'picó a' },
    poke:       { emoji: '👉', accion: 'poke',    mensaje: 'picó a' },
    punetazo:   { emoji: '👊', accion: 'punch',   mensaje: 'golpeó a' },
    punch:      { emoji: '👊', accion: 'punch',   mensaje: 'golpeó a' },
    reir:       { emoji: '😂', accion: 'laugh',   mensaje: 'se ríe de' },
    laugh:      { emoji: '😂', accion: 'laugh',   mensaje: 'se ríe de' },
    correr:     { emoji: '🏃', accion: 'run',     mensaje: 'corrió con' },
    run:        { emoji: '🏃', accion: 'run',     mensaje: 'corrió con' },
    triste:     { emoji: '😔', accion: 'sad',     mensaje: 'está triste con' },
    sad:        { emoji: '😔', accion: 'sad',     mensaje: 'está triste con' },
    enojado:    { emoji: '😠', accion: 'angry',   mensaje: 'está enojado con' },
    angry:      { emoji: '😠', accion: 'angry',   mensaje: 'está enojado con' },
    saludar:    { emoji: '👋', accion: 'wave',    mensaje: 'saludó a' },
    wave:       { emoji: '👋', accion: 'wave',    mensaje: 'saludó a' },
    aburrido:   { emoji: '😴', accion: 'bored',   mensaje: 'está aburrido con' },
    bored:      { emoji: '😴', accion: 'bored',   mensaje: 'está aburrido con' },
    bofetada:   { emoji: '🤦', accion: 'facepalm',mensaje: 'se da un facepalm por' },
    facepalm:   { emoji: '🤦', accion: 'facepalm',mensaje: 'se da un facepalm por' },
    feliz:      { emoji: '😄', accion: 'happy',   mensaje: 'está feliz con' },
    happy:      { emoji: '😄', accion: 'happy',   mensaje: 'está feliz con' },
    pensar:     { emoji: '🤔', accion: 'think',   mensaje: 'piensa en' },
    think:      { emoji: '🤔', accion: 'think',   mensaje: 'piensa en' },
    dormir:     { emoji: '😴', accion: 'sleep',   mensaje: 'duerme con' },
    sleep:      { emoji: '😴', accion: 'sleep',   mensaje: 'duerme con' },
    guinar:     { emoji: '😉', accion: 'wink',    mensaje: 'le guiñó el ojo a' },
    wink:       { emoji: '😉', accion: 'wink',    mensaje: 'le guiñó el ojo a' },
    lamer:      { emoji: '👅', accion: 'lick',    mensaje: 'lamió a' },
    lick:       { emoji: '👅', accion: 'lick',    mensaje: 'lamió a' },
    cosquillas: { emoji: '🤣', accion: 'tickle',  mensaje: 'hizo cosquillas a' },
    tickle:     { emoji: '🤣', accion: 'tickle',  mensaje: 'hizo cosquillas a' },
    comer:      { emoji: '🍜', accion: 'eat',     mensaje: 'come con' },
    eat:        { emoji: '🍜', accion: 'eat',     mensaje: 'come con' },
    matar:      { emoji: '⚔️', accion: 'kill',    mensaje: 'eliminó a' },
    kill:       { emoji: '⚔️', accion: 'kill',    mensaje: 'eliminó a' },
    seducir:    { emoji: '😏', accion: 'smug',    mensaje: 'sedujo a' },
    seduce:     { emoji: '😏', accion: 'smug',    mensaje: 'sedujo a' },
};

const NSFW_CMDS = {
    neko:     'https://nekos.life/api/v2/img/lewd',
    waifu:    'https://nekos.life/api/v2/img/waifu',
    hentai:   'https://nekos.life/api/v2/img/ero',
    ass:      'https://nekos.life/api/v2/img/ass',
    poto:     'https://nekos.life/api/v2/img/ass',
    pussy:    'https://nekos.life/api/v2/img/pussy',
    blowjob:  'https://nekos.life/api/v2/img/blowjob',
    mamada:   'https://nekos.life/api/v2/img/blowjob',
    bj:       'https://nekos.life/api/v2/img/blowjob',
    boobs:    'https://nekos.life/api/v2/img/boobs',
    tetas:    'https://nekos.life/api/v2/img/boobs',
    cum:      'https://nekos.life/api/v2/img/cum',
    anal:     'https://nekos.life/api/v2/img/anal',
    hentaigif:'https://nekos.life/api/v2/img/hentai_gifs',
    yuri:     'https://nekos.life/api/v2/img/les',
    tijeras:  'https://nekos.life/api/v2/img/les',
    loli:     'https://nekos.life/api/v2/img/neko',
    nekomimi: 'https://nekos.life/api/v2/img/neko',
};

const NSFW_ACCIONES = {
    anal:     { emoji: '🍑', texto: 'le metió el pito en el culo a' },
    blowjob:  { emoji: '💦', texto: 'le hizo una mamada a' },
    mamada:   { emoji: '💦', texto: 'le hizo una mamada a' },
    bj:       { emoji: '💦', texto: 'le hizo una mamada a' },
    fuck:     { emoji: '🔥', texto: 'se cogió a' },
    coger:    { emoji: '🔥', texto: 'se cogió a' },
    spank:    { emoji: '🍑', texto: 'le dio una nalgada a' },
    nalgada:  { emoji: '🍑', texto: 'le dio una nalgada a' },
    handjob:  { emoji: '💦', texto: 'le hizo una paja a' },
    paja:     { emoji: '💦', texto: 'se hizo una paja pensando en' },
    fap:      { emoji: '💦', texto: 'se hizo una paja pensando en' },
    cum:      { emoji: '💦', texto: 'se vino en' },
    yuri:     { emoji: '🌸', texto: 'hizo tijeras con' },
    tijeras:  { emoji: '🌸', texto: 'hizo tijeras con' },
    sixnine:  { emoji: '🔥', texto: 'hizo un 69 con' },
    undress:  { emoji: '👗', texto: 'desnudó a' },
    encuerar: { emoji: '👗', texto: 'desnudó a' },
    grope:    { emoji: '🙈', texto: 'manoseó a' },
    suckboobs:{ emoji: '🍈', texto: 'le chupó las tetas a' },
    lickass:  { emoji: '🍑', texto: 'le lamió el culo a' },
    lickpussy:{ emoji: '💦', texto: 'le lamió el coño a' },
    lickdick: { emoji: '💦', texto: 'le lamió el pene a' },
    footjob:  { emoji: '🦶', texto: 'le hizo una paja con los pies a' },
    boobjob:  { emoji: '🍈', texto: 'le hizo una rusa a' },
    cumshot:  { emoji: '💦', texto: 'disparó semen en' },
    cummouth: { emoji: '💦', texto: 'acabó en la boca de' },
    grabboobs:{ emoji: '🍈', texto: 'le agarró las tetas a' },
    impregnate:{ emoji: '🍼', texto: 'preñó a' },
    preg:     { emoji: '🍼', texto: 'preñó a' },
    prenar:   { emoji: '🍼', texto: 'preñó a' },
};

async function obtenerGifNekos(accion) {
    try {
        const res = await axios.get(`https://nekos.best/api/v2/${accion}`, { timeout: 10000 });
        return res.data.results[0].url;
    } catch {
        const res2 = await axios.get(`https://nekos.life/api/v2/img/${accion}`, { timeout: 10000 });
        return res2.data.url;
    }
}

async function obtenerImagenNsfw(url) {
    const res = await axios.get(url, { timeout: 10000 });
    return res.data.url;
}

async function cmdInteraccion(sock, jid, senderJid, accion, mencionados) {
    const config = SFW_ACCIONES[accion];
    if (!config) return;

    const senderNum = senderJid.split('@')[0];

    if (NSFW_ACCIONES[accion]) {
        const nsfwConfig = NSFW_ACCIONES[accion];
        let texto;
        if (mencionados && mencionados.length > 0) {
            const destinoNum = mencionados[0].split('@')[0];
            texto = `${nsfwConfig.emoji} *@${senderNum}* ${nsfwConfig.texto} *@${destinoNum}* 🔞`;
        } else {
            texto = `${nsfwConfig.emoji} *@${senderNum}* ${nsfwConfig.texto} *todos* 🔞`;
        }
        await sock.sendMessage(jid, { text: texto, mentions: mencionados || [] });
        return;
    }

    try {
        const gifUrl = await obtenerGifNekos(config.accion);
        let texto;
        if (mencionados && mencionados.length > 0) {
            const destinoNum = mencionados[0].split('@')[0];
            texto = `${config.emoji} *@${senderNum}* ${config.mensaje} *@${destinoNum}*`;
        } else {
            texto = `${config.emoji} *@${senderNum}* ${config.mensaje} *todos* 😄`;
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
    const url = NSFW_CMDS[tipo];
    if (!url) return;
    try {
        const imgUrl = await obtenerImagenNsfw(url);
        await sock.sendMessage(jid, {
            image: { url: imgUrl },
            caption: `🔞 *${tipo.toUpperCase()}*`
        });
    } catch (err) {
        await sock.sendMessage(jid, { text: '❌ No pude cargar la imagen. Intenta de nuevo.' });
    }
}

async function cmdNsfwAccion(sock, jid, senderJid, accion, mencionados) {
    const config = NSFW_ACCIONES[accion];
    if (!config) return;
    const senderNum = senderJid.split('@')[0];
    let texto;
    if (mencionados && mencionados.length > 0) {
        const destinoNum = mencionados[0].split('@')[0];
        texto = `${config.emoji} *@${senderNum}* ${config.texto} *@${destinoNum}* 🔞`;
    } else {
        texto = `${config.emoji} *@${senderNum}* ${config.texto} *todos* 🔞`;
    }
    await sock.sendMessage(jid, { text: texto, mentions: mencionados || [] });
}

const TODO_SFW = Object.keys(SFW_ACCIONES);
const TODO_NSFW_IMG = Object.keys(NSFW_CMDS);
const TODO_NSFW_ACCION = Object.keys(NSFW_ACCIONES);

module.exports = { cmdInteraccion, cmdNsfw, cmdNsfwAccion, TODO_SFW, TODO_NSFW_IMG, TODO_NSFW_ACCION };
