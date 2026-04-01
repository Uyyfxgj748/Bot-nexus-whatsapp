const { getGrupo } = require('./database');

async function cmdPing(sock, jid) {
    const inicio = Date.now();
    await sock.sendMessage(jid, { text: '🏓 Pong!' });
    const ms = Date.now() - inicio;
    await sock.sendMessage(jid, { text: `⚡ Latencia: *${ms}ms*` });
}

async function cmdStatus(sock, jid) {
    const mem = process.memoryUsage();
    const uptime = process.uptime();
    const horas = Math.floor(uptime / 3600);
    const minutos = Math.floor((uptime % 3600) / 60);
    const texto = `╔══════════════════╗
║    🤖 ESTADO BOT    ║
╚══════════════════╝
✅ Estado: *Online*
⏱️ Uptime: *${horas}h ${minutos}m*
💾 RAM: *${Math.round(mem.heapUsed / 1024 / 1024)}MB*
🟢 Funcionando correctamente`;
    await sock.sendMessage(jid, { text: texto });
}

async function cmdEliminar(sock, jid, msg) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    if (!quoted || !quoted.stanzaId) {
        await sock.sendMessage(jid, { text: '❌ Responde al mensaje que quieres eliminar.' });
        return;
    }
    try {
        await sock.sendMessage(jid, {
            delete: {
                remoteJid: jid,
                fromMe: false,
                id: quoted.stanzaId,
                participant: quoted.participant
            }
        });
    } catch {
        await sock.sendMessage(jid, { text: '❌ No pude eliminar ese mensaje. Asegúrate de que soy administrador.' });
    }
}

async function cmdFotoPerfil(sock, jid, senderJid, mencionados) {
    const objetivo = mencionados && mencionados.length > 0 ? mencionados[0] : senderJid;
    try {
        const url = await sock.profilePictureUrl(objetivo, 'image');
        await sock.sendMessage(jid, {
            image: { url },
            caption: `🖼️ Foto de perfil de @${objetivo.split('@')[0]}`,
            mentions: [objetivo]
        });
    } catch {
        await sock.sendMessage(jid, { text: '❌ No pude obtener la foto de perfil. Es posible que sea privada.' });
    }
}

async function cmdTagAll(sock, jid, groupMetadata, args) {
    if (!groupMetadata) {
        await sock.sendMessage(jid, { text: '❌ Este comando solo funciona en grupos.' });
        return;
    }
    const participantes = groupMetadata.participants.map(p => p.id);
    const mensaje = args.join(' ') || '📢 Atención a todos!';
    const menciones = participantes.map(p => `@${p.split('@')[0]}`).join(' ');
    await sock.sendMessage(jid, {
        text: `${mensaje}\n\n${menciones}`,
        mentions: participantes
    });
}

async function cmdStickerAImagen(sock, jid, msg) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quoted || !quoted.stickerMessage) {
        await sock.sendMessage(jid, {
            text: '❌ Responde a un sticker para convertirlo a imagen.'
        });
        return;
    }

    try {
        const buffer = await sock.downloadMediaMessage({
            message: quoted
        });

        await sock.sendMessage(jid, {
            image: buffer,
            caption: '🖼️ Aquí tienes tu sticker convertido en imagen'
        });

    } catch (err) {
        console.error(err);

        await sock.sendMessage(jid, {
            text: '❌ No pude convertir el sticker a imagen.'
        });
    }
}

module.exports = { cmdPing, cmdStatus, cmdEliminar, cmdFotoPerfil, cmdTagAll, cmdStickerAImagen };
