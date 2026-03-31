const { enviarMenu } = require('./menu');
const { cmdPerfil, cmdSaldo, cmdDiario, cmdTransferir, cmdTienda, cmdComprar, cmdInventario } = require('./economy');
const { cmdInteraccion, cmdNsfw } = require('./interactions');
const { cmdSticker } = require('./sticker');
const { cmdYoutube, cmdTiktok, cmdImagen } = require('./downloads');
const { getUsuario } = require('./database');

const INTERACCIONES_SFW = ['abrazar', 'besar', 'golpear', 'acariciar', 'bailar'];
const NSFW_CMDS = ['neko', 'waifu', 'hentai'];

async function manejarMensaje(sock, msg) {
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    const senderJid = msg.key.participant || msg.key.remoteJid;

    const texto = (
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        ''
    ).trim();

    if (!texto.startsWith('!')) return;

    const [cmd, ...args] = texto.slice(1).toLowerCase().split(' ');
    const mencionados = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

    getUsuario(senderJid);

    try {
        if (cmd === 'menu' || cmd === 'ayuda') {
            await enviarMenu(sock, jid);
        }

        else if (cmd === 'perfil') {
            await cmdPerfil(sock, jid, senderJid);
        }
        else if (cmd === 'saldo') {
            await cmdSaldo(sock, jid, senderJid);
        }
        else if (cmd === 'diario') {
            await cmdDiario(sock, jid, senderJid);
        }
        else if (cmd === 'transferir') {
            await cmdTransferir(sock, jid, senderJid, texto.slice(1 + cmd.length + 1), mencionados);
        }
        else if (cmd === 'tienda') {
            await cmdTienda(sock, jid);
        }
        else if (cmd === 'comprar') {
            await cmdComprar(sock, jid, senderJid, args);
        }
        else if (cmd === 'inventario') {
            await cmdInventario(sock, jid, senderJid);
        }

        else if (cmd === 'sticker') {
            await cmdSticker(sock, jid, msg);
        }

        else if (cmd === 'yt') {
            await cmdYoutube(sock, jid, args);
        }
        else if (cmd === 'tiktok') {
            await cmdTiktok(sock, jid, args);
        }
        else if (cmd === 'img') {
            await cmdImagen(sock, jid, args);
        }

        else if (INTERACCIONES_SFW.includes(cmd)) {
            await cmdInteraccion(sock, jid, senderJid, cmd, mencionados);
        }

        else if (NSFW_CMDS.includes(cmd)) {
            await cmdNsfw(sock, jid, cmd);
        }

    } catch (err) {
        console.error(`Error en comando !${cmd}:`, err.message);
        await sock.sendMessage(jid, { text: `❌ Error al ejecutar el comando: ${err.message}` });
    }
}

module.exports = { manejarMensaje };
