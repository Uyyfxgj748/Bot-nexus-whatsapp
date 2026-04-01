const axios = require('axios');

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // tildes
        .replace(/[^a-z0-9 ]/g, " ")     // símbolos raros
        .replace(/\s+/g, " ")
        .trim();
}
         //BASE DE DATOS WAIFU 
const waifuDB = [
    { key: 'rem', tag: 'rem_(re_zero)' },
    { key: 'ram', tag: 'ram_(re_zero)' },
    { key: 'emilia', tag: 'emilia_(re_zero)' },
    { key: 'mikasa', tag: 'mikasa_ackerman' },
    { key: 'asuna', tag: 'asuna_(sao)' },
    { key: 'zero two', tag: 'zero_two' },
    { key: '02', tag: 'zero_two' },
    { key: 'nezuko', tag: 'kamado_nezuko' },
    { key: 'shinobu', tag: 'kochou_shinobu' },
    { key: 'mitsuri', tag: 'kanroji_mitsuri' },
    { key: 'hinata', tag: 'hyuuga_hinata' },
    { key: 'sakura', tag: 'haruno_sakura' },
    { key: 'kurumi', tag: 'tokisaki_kurumi' },
    { key: 'marin', tag: 'kitagawa_marin' },
    { key: 'tohru', tag: 'tohru_(kobayashi_dragon_maid)' },
        //Re Zero
    { key: 'kanna', tag: 'kanna_kamui' },
    { key: 'nino', tag: 'nakano_nino' },
    { key: 'miku', tag: 'nakano_miku' },
    { key: 'rem', tag: 'rem_(re_zero)' },
    { key: 'ram', tag: 'ram_(re_zero)' },
    { key: 'emilia', tag: 'emilia_(re_zero)' },
    { key: 'beatrice', tag: 'beatrice_(re_zero)' },

    // Sword Art Online
    { key: 'asuna', tag: 'asuna_(sao)' },
    { key: 'suguha', tag: 'suguha_kirigaya' },
    { key: 'silica', tag: 'silica_(sao)' },

    // Attack on Titan
    { key: 'mikasa', tag: 'mikasa_ackerman' },
    { key: 'historia', tag: 'historia_reiss' },
    { key: 'annie', tag: 'annie_leonhardt' },

    // Naruto
    { key: 'hinata', tag: 'hinata_hyuga' },
    { key: 'sakura', tag: 'haruno_sakura' },
    { key: 'tsunade', tag: 'tsunade' },

    // Demon Slayer
    { key: 'nezuko', tag: 'kamado_nezuko' },
    { key: 'shinobu', tag: 'kochou_shinobu' },
    { key: 'mitsuri', tag: 'kanroji_mitsuri' },

    // Jujutsu Kaisen
    { key: 'nobara', tag: 'kugisaki_nobara' },
    { key: 'maki', tag: 'zenin_maki' },
    { key: 'mai', tag: 'zenin_mai' },

    // Tokyo Ghoul
    { key: 'touka', tag: 'kirishima_touka' },

    // Darling in the Franxx
    { key: 'zero two', tag: 'zero_two' },
    { key: 'ichigo', tag: 'ichigo_(darling_in_the_franxx)' },

    // Fate series
    { key: 'saber', tag: 'saber_(fate)' },
    { key: 'rin', tag: 'tohsaka_rin' },
    { key: 'illya', tag: 'illyasviel_von_einzbern' },

    // Pokémon
    { key: 'misty', tag: 'kasumi_(pokemon)' },
    { key: 'dawn', tag: 'hikari_(pokemon)' },
    { key: 'serena', tag: 'serena_(pokemon)' },

    // Vocaloid
    { key: 'miku', tag: 'hatsune_miku' },
    { key: 'rin', tag: 'kagamine_rin' },
    { key: 'luka', tag: 'megurine_luka' },

    // Chainsaw Man
    { key: 'makima', tag: 'makima_(chainsaw_man)' },
    { key: 'power', tag: 'power_(chainsaw_man)' },

    // 🔵 Konosuba
    { key: 'aqua', tag: 'aqua_(konosuba)' },
    { key: 'megumin', tag: 'megumin_(konosuba)' },
    { key: 'darkness', tag: 'lalatina_dustiness_ford' },

    // 🟣 Re:Zero extras
    { key: 'echidna', tag: 'echidna_(re_zero)' },
    { key: 'satella', tag: 'satella_(re_zero)' },

    // 🔴 Spy x Family
    { key: 'anya', tag: 'anya_forger' },
    { key: 'yor', tag: 'yor_forger' },

    // 🟡 Date A Live
    { key: 'tohka', tag: 'yatogami_tohka' },
    { key: 'kotori', tag: 'itsuka_kotori' },

    // 🟢 Overlord
    { key: 'albedo', tag: 'albedo_(overlord)' },
    { key: 'shalltear', tag: 'shalltear_bloodfallen' },

    // 🔵 Black Clover
    { key: 'noelle', tag: 'noelle_silva' },

    // 🟣 Evangelion
    { key: 'rei', tag: 'ayanami_rei' },
    { key: 'asuka', tag: 'souryuu_asuka_langley' },

    // 🔴 Chainsaw Man extras
    { key: 'reze', tag: 'reze_(chainsaw_man)' },

    // 🟡 Bleach
    { key: 'rukia', tag: 'kuchiki_rukia' },
    { key: 'orihime', tag: 'inoue_orihime' },

    // 🟢 Dragon Ball
    { key: 'bulma', tag: 'bulma' },
    { key: 'android 18', tag: 'android_18' },

    // 🔵 High School DxD
    { key: 'rias', tag: 'rias_gremory' },
    { key: 'akeno', tag: 'himejima_akeno' },

    // 🟣 No Game No Life
    { key: 'shiro', tag: 'shiro_(no_game_no_life)' },

    // 🔴 Toradora
    { key: 'taiga', tag: 'aisaka_taiga' },

    // 🟡 Rent-a-Girlfriend
    { key: 'chizuru', tag: 'mizuhara_chizuru' },

    // 🟢 Tokyo Revengers
    { key: 'hinata tokyo revengers', tag: 'tachibana_hinata' },

    // 🔵 Lycoris Recoil
    { key: 'chisato', tag: 'nishikigi_chisato' },
    { key: 'takina', tag: 'inoue_takina' },

    // 🟣 Chainsaw Man extras 2
    { key: 'himeno', tag: 'himeno_(chainsaw_man)' },

    // 🔴 Darling extras
    { key: 'kokoro', tag: 'kokoro_(darling_in_the_franxx)' },

    // 🟡 Goblin Slayer
    { key: 'priestess', tag: 'priestess_(goblin_slayer)' },

    // 🟢 Genshin Impact (muy importante)
    { key: 'lumine', tag: 'lumine_(genshin_impact)' },
    { key: 'aether', tag: 'aether_(genshin_impact)' },
    { key: 'ganyu', tag: 'ganyu_(genshin_impact)' },
    { key: 'hu tao', tag: 'hu_tao_(genshin_impact)' },
    { key: 'raiden', tag: 'raiden_shogun' },
    { key: 'yae miko', tag: 'yae_miko' },

    // 🔵 Honkai
    { key: 'kiana', tag: 'kiana_kaslana' },
    { key: 'mei', tag: 'raiden_mei' },
    { key: 'bronya', tag: 'bronya_zaychik' },

    // 🟣 Vocaloid extras
    { key: 'gumi', tag: 'gumi_(vocaloid)' },

    // 🔴 Misc anime girls
    { key: 'marin', tag: 'kitagawa_marin' },
    { key: 'power chainsaw', tag: 'power_(chainsaw_man)' },
    { key: 'kurumi', tag: 'tokisaki_kurumi' },

    // 🟡 fallback
    { key: 'waifu', tag: '1girl' },
    { key: 'girl', tag: '1girl' },

    // My Hero Academia
    { key: 'ochako', tag: 'uraraka_ochako' },
    { key: 'tsuyu', tag: 'asui_tsuyu' },
    { key: 'momo', tag: 'yaoyorozu_momo' },

    // Cyberpunk Edgerunners
    { key: 'lucy', tag: 'lucy_(cyberpunk_edgerunners)' },

    // One Piece
    { key: 'nami', tag: 'nami_(one_piece)' },
    { key: 'robin', tag: 'nico_robin' },

    // General extras
    { key: 'waifu', tag: '1girl' },
    { key: 'girl', tag: '1girl' }
];

        //FUNCIÓN ENCONTRAR WAIFU
function encontrarWaifu(input) {
    if (!input) return null;

    const q = input.toLowerCase().trim();

    let found = waifuDB.find(w => w.key === q);
    if (found) return found;

    found = waifuDB.find(w => w.key.includes(q));
    if (found) return found;

    found = waifuDB.find(w =>
        q.split('').every(char => w.key.includes(char))
    );

    return found || null;
}

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

async function cmdWaifu(sock, jid, args) {
    try {

        let url;
        let nombre = args.join(' ');

        // 🧠 búsqueda inteligente
        const waifu = encontrarWaifu(nombre);

        let query;

        if (!nombre) {
            const res = await axios.get('https://api.waifu.pics/sfw/waifu');
            url = res.data.url;

        } else {

            query = waifu ? waifu.tag : nombre.replace(/\s+/g, '_');

            const res = await axios.get(
                `https://danbooru.donmai.us/posts.json?tags=${query}+rating:safe&limit=50`
            );

            if (!res.data.length) {
                await sock.sendMessage(jid, {
                    text: `❌ No encontré *${nombre}* 😔`
                });
                return;
            }

            const random = res.data[Math.floor(Math.random() * res.data.length)];
            url = random.file_url;
        }

        await sock.sendMessage(jid, {
            image: { url },
            caption: nombre
                ? `🔍 Resultado inteligente para: *${nombre}*`
                : '💖 Waifu random en HD'
        });

    } catch (err) {
        console.error(err);
        await sock.sendMessage(jid, {
            text: '❌ Error buscando waifu'
        });
    }
}

const TODO_SFW = Object.keys(SFW_ACCIONES);
const TODO_NSFW_IMG = Object.keys(NSFW_CMDS);
const TODO_NSFW_ACCION = Object.keys(NSFW_ACCIONES);

module.exports = { cmdInteraccion, cmdNsfw, cmdNsfwAccion,cmdWaifu, TODO_SFW, TODO_NSFW_IMG, TODO_NSFW_ACCION };
