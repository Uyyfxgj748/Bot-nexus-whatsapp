// handler.js

const OWNER = '124602017677540@lid'

const fs = require('fs');
const axios = require('axios'); // Para requests HTTP

const rutaEstado = './data/estado.json';
let botActivo;

// Cargar o crear estado
if (fs.existsSync(rutaEstado)) {
    const data = JSON.parse(fs.readFileSync(rutaEstado));
    botActivo = data.activo;
} else {
    botActivo = true;
    fs.writeFileSync(rutaEstado, JSON.stringify({ activo: true }, null, 2));
}

// Guardar estado
function guardarEstado() {
    fs.writeFileSync(rutaEstado, JSON.stringify({ activo: botActivo }, null, 2));
}

// Módulos externos
const { enviarMenu } = require('./menu');

const { 
    cmdSaldo, cmdDiario, cmdWork, cmdCrime, cmdSlut, cmdCoinflip, 
    cmdDeposit, cmdWithdraw, cmdRoulette, cmdSteal, cmdTransferir, 
    cmdBaltop, cmdTienda, cmdComprar, cmdInventario 
} = require('./economy');

const { 
    cmdInteraccion, cmdNsfw, cmdNsfwAccion, cmdWaifu, 
    TODO_SFW, TODO_NSFW_IMG, TODO_NSFW_ACCION 
} = require('./interactions');

const { cmdSticker, cmdStickerSearch } = require('./sticker');

const { 
    cmdYoutube, cmdYoutubeAudio, cmdYoutubeSearch, cmdTiktok, 
    cmdTwitter, cmdInstagram, cmdImagen 
} = require('./downloads');

const { 
    cmdPing, cmdStatus, cmdEliminar, cmdFotoPerfil, cmdTagAll, 
    cmdStickerAImagen 
} = require('./utils');

const { 
    cmdPerfil, cmdSetbirth, cmdSetdesc, cmdSetgenre, cmdMarry, 
    cmdDivorce, cmdLevel, cmdLeaderboard, cmdCumpleanos 
} = require('./profile');

const { 
    esAdmin, verificarAntilink, cmdKick, cmdPromote, cmdDemote, 
    cmdAntilink, cmdClose, cmdSetwelcome, cmdSetgoodbye, cmdWelcome, 
    cmdGoodbye, cmdOnlyadmin, cmdOpen, cmdWarn, cmdDelwarn, cmdWarns, 
    cmdSetwarnlimit, cmdTopmensajes 
} = require('./admin');

const { getUsuario, getGrupo, agregarExp } = require('./database');

// =======================
//  FUNCIONES DE BÚSQUEDA
// =======================

// Unsplash
async function buscarUnsplash(query, maxImages = 3) {
    const ACCESS_KEY = process.env.UNSPLASH_KEY;
    try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: { query: query, per_page: maxImages },
            headers: { Authorization: `Client-ID ${ACCESS_KEY}` }
        });

        return response.data.results.map(img => ({
            url: img.urls.regular,
            desc: img.alt_description || 'Imagen relacionada'
        }));
    } catch (err) {
        console.error('Error Unsplash:', err);
        return [];
    }
}

// Bing + Pinterest
async function buscarPinterest(query, maxImages = 3) {
    try {
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query + " site:pinterest.com")}`;
        const { data } = await axios.get(url);

        const regex = /murl&quot;:&quot;(.*?)&quot;/g;
        const matches = [...data.matchAll(regex)];

        return matches.slice(0, maxImages).map(m => m[1]);
    } catch (err) {
        console.error('Error Bing Pinterest:', err);
        return [];
    }
}

// =======================
//  COMANDO #PIN FLEXIBLE CON RESPUESTA
// =======================

// Map para guardar query asociada a cada mensaje
const pinMap = new Map();

async function manejarPin(sock, msg, isReply = false) {
    const from = msg.key.remoteJid;
    let query;

    if (isReply) {
        // Si es respuesta a la imagen, obtener query guardada
        const repliedMsgId = msg.message.extendedTextMessage?.contextInfo?.stanzaId;
        if (!repliedMsgId || !pinMap.has(repliedMsgId)) return;
        query = pinMap.get(repliedMsgId);
    } else {
        const text = msg.message?.conversation || '';
        const args = text.slice(5).trim().split(' ').filter(Boolean);
        query = args.length > 0 ? args.join(' ') : text.slice(5);
        if (!query) return;
    }

    // Buscar imágenes
    let imagenes = await buscarPinterest(query, 3);
    let captions = [];

    if (imagenes.length === 0) {
        const results = await buscarUnsplash(query, 3);
        if (results.length > 0) {
            imagenes = results.map(r => r.url);
            captions = results.map(r => r.desc);
        }
    }

    if (imagenes.length === 0) {
        await sock.sendMessage(from, { text: 'No encontré imágenes 😓' });
        return;
    }

    // Elegir imagen aleatoria
    const idx = Math.floor(Math.random() * imagenes.length);
    const url = imagenes[idx];
    const caption = captions[idx] || `✨ Resultado para: ${query}\n📌 Una imagen que te puede gustar`;

    // Enviar la imagen
    const sentMsg = await sock.sendMessage(from, {
        image: { url },
        caption,
        footer: 'Pinterest Style Bot\nResponde con 🔄 o #again para otra imagen'
    });

    // Guardar query para responder con 🔄 o #again
    pinMap.set(sentMsg.key.id, query);
}

// =======================
//  HANDLER PRINCIPAL
// =======================
async function manejarMensaje(sock, msg, groupMetadata) {
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const esGrupo = jid.endsWith('@g.us');

    const texto = (
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        ''
    ).trim();

    // 🔴 OFF
    if (texto.toLowerCase() === '#off') {
        if (senderJid !== OWNER) {
            await sock.sendMessage(jid, { text: '⛔ No tienes permiso para usar este comando' });
            return;
        }
        botActivo = false;
        guardarEstado();
        await sock.sendMessage(jid, { text: '😴 Bot desactivado' });
        return;
    }

    // 🟢 ON
    if (texto.toLowerCase() === '#on') {
        if (senderJid !== OWNER) {
            await sock.sendMessage(jid, { text: '⛔ No tienes permiso para usar este comando' });
            return;
        }
        botActivo = true;
        guardarEstado();
        await sock.sendMessage(jid, { text: '⚡ Bot activado' });
        return;
    }

    // 🔒 Bloqueo global
    if (!botActivo) {
        if (texto.startsWith('#')) {
            await sock.sendMessage(jid, { text: '⚠️ El bot está apagado. Usa #on para activarlo.' });
        }
        return;
    }

    // EXP en grupos
    if (esGrupo && texto) agregarExp(senderJid, 5);

    // Verificar antilink
    if (esGrupo && texto && !texto.startsWith('#')) {
        await verificarAntilink(sock, jid, msg, groupMetadata, senderJid);
    }

    // Solo comandos
    if (!texto.startsWith('#') && !texto.startsWith('🔄')) return;

    const [cmd, ...args] = texto.startsWith('#') ? texto.slice(1).toLowerCase().split(' ') : [texto.toLowerCase()];
    const mencionados = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const g = esGrupo ? getGrupo(jid) : null;

    if (g && g.soloAdmin && !esAdmin(groupMetadata, senderJid)) return;

    getUsuario(senderJid);

    try {
        // RESPONDER A #PIN 🔄 O #again
        if ((texto === '🔄' || texto.toLowerCase().startsWith('#again')) &&
            msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            await manejarPin(sock, msg, true);
            return;
        }

        switch (cmd) {
            // MENÚ Y UTILIDADES
            case 'menu': case 'ayuda': case 'help': case 'commands': case 'comandos':
                await enviarMenu(sock, jid); break;
            case 'ping': case 'p':
                await cmdPing(sock, jid); break;
            case 'status': case 'botinfo': case 'infobot':
                await cmdStatus(sock, jid); break;
            case 'del': case 'delete':
                await cmdEliminar(sock, jid, msg); break;
            case 'pfp': case 'getpic':
                await cmdFotoPerfil(sock, jid, senderJid, mencionados); break;
            case 'tagall': case 'tag': case 'hidetag': case 'tagsay':
                await cmdTagAll(sock, jid, groupMetadata, args); break;
            case 'toimage': case 'toimg':
                await cmdStickerAImagen(sock, jid, msg); break;

            // ECONOMÍA
            case 'saldo': case 'balance': case 'bal': case 'coins':
                await cmdSaldo(sock, jid, senderJid); break;
            case 'diario': case 'daily':
                await cmdDiario(sock, jid, senderJid); break;
            case 'work': case 'w': case 'trabajar':
                await cmdWork(sock, jid, senderJid); break;
            case 'crime': case 'crimen':
                await cmdCrime(sock, jid, senderJid); break;
            case 'slut':
                await cmdSlut(sock, jid, senderJid); break;
            case 'coinflip': case 'flip': case 'cf':
                await cmdCoinflip(sock, jid, senderJid, args); break;
            case 'depositar': case 'deposit': case 'dep': case 'd':
                await cmdDeposit(sock, jid, senderJid, args); break;
            case 'retirar': case 'withdraw': case 'with':
                await cmdWithdraw(sock, jid, senderJid, args); break;
            case 'ruleta': case 'roulette': case 'rt':
                await cmdRoulette(sock, jid, senderJid, args); break;
            case 'robar': case 'steal': case 'rob':
                await cmdSteal(sock, jid, senderJid, mencionados); break;
            case 'transferir': case 'givecoins': case 'pay': case 'coinsgive':
                await cmdTransferir(sock, jid, senderJid, mencionados, args); break;
            case 'baltop': case 'economyboard': case 'eboard':
                await cmdBaltop(sock, jid); break;
            case 'tienda':
                await cmdTienda(sock, jid); break;
            case 'comprar':
                await cmdComprar(sock, jid, senderJid, args); break;
            case 'inventario':
                await cmdInventario(sock, jid, senderJid); break;

            // PERFIL
            case 'perfil': case 'profile':
                await cmdPerfil(sock, jid, senderJid, mencionados); break;
            case 'setbirth':
                await cmdSetbirth(sock, jid, senderJid, args); break;
            case 'setdesc': case 'setdescription':
                await cmdSetdesc(sock, jid, senderJid, args); break;
            case 'setgenre':
                await cmdSetgenre(sock, jid, senderJid, args); break;
            case 'marry': case 'casarse':
                await cmdMarry(sock, jid, senderJid, mencionados); break;
            case 'divorce':
                await cmdDivorce(sock, jid, senderJid); break;
            case 'level': case 'lvl':
                await cmdLevel(sock, jid, senderJid, mencionados); break;
            case 'leaderboard': case 'lboard': case 'top':
                await cmdLeaderboard(sock, jid); break;
            case 'cumpleanos': case 'cumpleaños': case 'birthdays':
                await cmdCumpleanos(sock, jid); break;

            // STICKERS
            case 'sticker': case 's': case 'stickers':
                await cmdSticker(sock, jid, msg); break;
            case 'stickersearch': case 'sticker_search': case 'stickerbus':
                await cmdStickerSearch(sock, jid, args); break;

            // DESCARGAS
            case 'yt': case 'mp4': case 'ytmp4':
                await cmdYoutube(sock, jid, args); break;
            case 'play': case 'ytaudio': case 'playaudio':
                await cmdYoutubeAudio(sock, jid, args); break;
            case 'ytsearch': case 'search':
                await cmdYoutubeSearch(sock, jid, args); break;
            case 'tiktok': case 'tt':
                await cmdTiktok(sock, jid, args); break;
            case 'twitter': case 'x':
                await cmdTwitter(sock, jid, args); break;
            case 'instagram': case 'ig': case 'reel':
                await cmdInstagram(sock, jid, args); break;

            // COMANDO PRO #PIN
            case 'pin': case 'pinterest':
                await manejarPin(sock, msg); break;

            case 'img':
                await cmdImagen(sock, jid, args); break;

            // ADMIN
            case 'setwelcome':
                await cmdSetwelcome(sock, jid, groupMetadata, senderJid, args); break;
            case 'setgoodbye':
                await cmdSetgoodbye(sock, jid, groupMetadata, senderJid, args); break;
            case 'welcome': case 'bienvenida':
                await cmdWelcome(sock, jid, groupMetadata, senderJid, args); break;
            case 'goodbye': case 'despedida':
                await cmdGoodbye(sock, jid, groupMetadata, senderJid, args); break;
            case 'onlyadmin': case 'onlyadmins':
                await cmdOnlyadmin(sock, jid, groupMetadata, senderJid, args); break;
            case 'open':
                await cmdOpen(sock, jid, groupMetadata, senderJid); break;
            case 'close':
                await cmdClose(sock, jid, groupMetadata, senderJid); break;
            case 'kick':
                await cmdKick(sock, jid, groupMetadata, senderJid, mencionados); break;
            case 'promote':
                await cmdPromote(sock, jid, groupMetadata, senderJid, mencionados); break;
            case 'demote':
                await cmdDemote(sock, jid, groupMetadata, senderJid, mencionados); break;
            case 'antilink': case 'antienlace':
                await cmdAntilink(sock, jid, groupMetadata, senderJid, args); break;
            case 'warn':
                await cmdWarn(sock, jid, groupMetadata, senderJid, mencionados, args); break;
            case 'delwarn':
                await cmdDelwarn(sock, jid, groupMetadata, senderJid, mencionados); break;
            case 'warns':
                await cmdWarns(sock, jid, groupMetadata, senderJid, mencionados); break;
            case 'setwarnlimit':
                await cmdSetwarnlimit(sock, jid, groupMetadata, senderJid, args); break;
            case 'topmensajes': case 'topcount': case 'topmessages': case 'topmsgcount':
                await cmdTopmensajes(sock, jid); break;

            // WAIFU / INTERACCIONES
            case 'waifu':
                await cmdWaifu(sock, jid, args); break;

            default:
                if (TODO_SFW.includes(cmd)) {
                    await cmdInteraccion(sock, jid, senderJid, cmd, mencionados);
                } else if (TODO_NSFW_IMG.includes(cmd)) {
                    await cmdNsfw(sock, jid, cmd);
                } else if (TODO_NSFW_ACCION.includes(cmd)) {
                    await cmdNsfwAccion(sock, jid, senderJid, cmd, mencionados);
                }
        }
    } catch (err) {
        console.error(`Error en comando #${cmd}:`, err.message);
        await sock.sendMessage(jid, { text: `❌ Error al ejecutar el comando: ${err.message}` });
    }
}

module.exports = { manejarMensaje };