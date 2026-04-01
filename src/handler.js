const { enviarMenu } = require('./menu');
const { cmdSaldo, cmdDiario, cmdWork, cmdCrime, cmdSlut, cmdCoinflip, cmdDeposit, cmdWithdraw, cmdRoulette, cmdSteal, cmdTransferir, cmdBaltop, cmdTienda, cmdComprar, cmdInventario } = require('./economy');
const { cmdInteraccion, cmdNsfw, cmdNsfwAccion, TODO_SFW, TODO_NSFW_IMG, TODO_NSFW_ACCION } = require('./interactions');
const { cmdSticker } = require('./sticker');
const { cmdYoutube, cmdYoutubeAudio, cmdYoutubeSearch, cmdTiktok, cmdTwitter, cmdInstagram, cmdPinterest, cmdImagen } = require('./downloads');
const { cmdPing, cmdStatus, cmdEliminar, cmdFotoPerfil, cmdTagAll, cmdStickerAImagen } = require('./utils');
const { cmdPerfil, cmdSetbirth, cmdSetdesc, cmdSetgenre, cmdMarry, cmdDivorce, cmdLevel, cmdLeaderboard, cmdCumpleanos } = require('./profile');
const { esAdmin, verificarAntilink, cmdKick, cmdPromote, cmdDemote, cmdAntilink, cmdClose, cmdSetwelcome, cmdSetgoodbye, cmdWelcome, cmdGoodbye, cmdOnlyadmin, cmdOpen, cmdWarn, cmdDelwarn, cmdWarns, cmdSetwarnlimit, cmdTopmensajes } = require('./admin');
const { getUsuario, getGrupo, agregarExp } = require('./database');

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

    if (esGrupo && texto) {
        agregarExp(senderJid, 5);
    }

    if (esGrupo && texto && !texto.startsWith('#')) {
        await verificarAntilink(sock, jid, msg, groupMetadata, senderJid);
    }

    if (!texto.startsWith('#')) return;

    const [cmd, ...args] = texto.slice(1).toLowerCase().split(' ');
    const mencionados = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

    const g = esGrupo ? getGrupo(jid) : null;
    if (g && g.soloAdmin && !esAdmin(groupMetadata, senderJid)) return;

    getUsuario(senderJid);

    try {
        switch (cmd) {
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

            case 'sticker': case 's': case 'stickers':
                await cmdSticker(sock, jid, msg); break;

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
            case 'pinterest': case 'pin':
                await cmdPinterest(sock, jid, args); break;
            case 'img':
                await cmdImagen(sock, jid, args); break;

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
