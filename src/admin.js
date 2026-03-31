const { getGrupo, guardarGrupo, getUsuario, guardarUsuario, cargarUsuarios } = require('./database');

function esAdmin(groupMetadata, jid) {
    if (!groupMetadata) return false;
    const participante = groupMetadata.participants.find(p => p.id === jid);
    return participante && (participante.admin === 'admin' || participante.admin === 'superadmin');
}

async function cmdSetwelcome(sock, jid, groupMetadata, senderJid, args) {
    if (!esAdmin(groupMetadata, senderJid)) {
        await sock.sendMessage(jid, { text: '❌ Solo los administradores pueden usar este comando.' });
        return;
    }
    const texto = args.join(' ');
    if (!texto) {
        await sock.sendMessage(jid, { text: '❌ Uso: #setwelcome [texto]\nUsa @usuario para mencionar al nuevo miembro.' });
        return;
    }
    const g = getGrupo(jid);
    g.mensajeBienvenida = texto;
    guardarGrupo(jid, g);
    await sock.sendMessage(jid, { text: `✅ Mensaje de bienvenida establecido:\n\n_${texto}_` });
}

async function cmdSetgoodbye(sock, jid, groupMetadata, senderJid, args) {
    if (!esAdmin(groupMetadata, senderJid)) {
        await sock.sendMessage(jid, { text: '❌ Solo los administradores pueden usar este comando.' });
        return;
    }
    const texto = args.join(' ');
    if (!texto) {
        await sock.sendMessage(jid, { text: '❌ Uso: #setgoodbye [texto]' });
        return;
    }
    const g = getGrupo(jid);
    g.mensajeDespedida = texto;
    guardarGrupo(jid, g);
    await sock.sendMessage(jid, { text: `✅ Mensaje de despedida establecido:\n\n_${texto}_` });
}

async function cmdWelcome(sock, jid, groupMetadata, senderJid, args) {
    if (!esAdmin(groupMetadata, senderJid)) {
        await sock.sendMessage(jid, { text: '❌ Solo los administradores pueden usar este comando.' });
        return;
    }
    const opcion = args[0];
    if (!opcion || !['enable', 'disable'].includes(opcion)) {
        await sock.sendMessage(jid, { text: '❌ Uso: #welcome enable | disable' });
        return;
    }
    const g = getGrupo(jid);
    g.bienvenida = opcion === 'enable';
    guardarGrupo(jid, g);
    await sock.sendMessage(jid, { text: `✅ Bienvenida *${opcion === 'enable' ? 'activada' : 'desactivada'}*` });
}

async function cmdOnlyadmin(sock, jid, groupMetadata, senderJid, args) {
    if (!esAdmin(groupMetadata, senderJid)) {
        await sock.sendMessage(jid, { text: '❌ Solo los administradores pueden usar este comando.' });
        return;
    }
    const opcion = args[0];
    if (!opcion || !['enable', 'disable'].includes(opcion)) {
        await sock.sendMessage(jid, { text: '❌ Uso: #onlyadmin enable | disable' });
        return;
    }
    const g = getGrupo(jid);
    g.soloAdmin = opcion === 'enable';
    guardarGrupo(jid, g);
    await sock.sendMessage(jid, { text: `✅ Modo solo admins *${opcion === 'enable' ? 'activado' : 'desactivado'}*` });
}

async function cmdOpen(sock, jid, groupMetadata, senderJid) {
    if (!esAdmin(groupMetadata, senderJid)) {
        await sock.sendMessage(jid, { text: '❌ Solo los administradores pueden usar este comando.' });
        return;
    }
    try {
        await sock.groupSettingUpdate(jid, 'not_announcement');
        await sock.sendMessage(jid, { text: '🔓 Grupo abierto. Todos pueden enviar mensajes.' });
    } catch {
        await sock.sendMessage(jid, { text: '❌ No pude abrir el grupo. Asegúrate de que soy administrador.' });
    }
}

async function cmdWarn(sock, jid, groupMetadata, senderJid, mencionados, args) {
    if (!esAdmin(groupMetadata, senderJid)) {
        await sock.sendMessage(jid, { text: '❌ Solo los administradores pueden usar este comando.' });
        return;
    }
    if (!mencionados || mencionados.length === 0) {
        await sock.sendMessage(jid, { text: '❌ Uso: #warn @usuario [razón]' });
        return;
    }
    const objetivo = mencionados[0];
    const razon = args.filter(a => !a.startsWith('@')).join(' ') || 'Sin razón especificada';
    const g = getGrupo(jid);
    const u = getUsuario(objetivo);
    u.advertencias = (u.advertencias || 0) + 1;
    guardarUsuario(objetivo, u);
    const limite = g.limiteAdvertencias || 3;
    await sock.sendMessage(jid, {
        text: `⚠️ *Advertencia* para @${objetivo.split('@')[0]}\n📝 Razón: ${razon}\n🔢 Advertencias: *${u.advertencias}/${limite}*`,
        mentions: [objetivo]
    });
    if (u.advertencias >= limite) {
        try {
            await sock.groupParticipantsUpdate(jid, [objetivo], 'remove');
            await sock.sendMessage(jid, {
                text: `🚫 @${objetivo.split('@')[0]} fue expulsado por alcanzar el límite de advertencias.`,
                mentions: [objetivo]
            });
            u.advertencias = 0;
            guardarUsuario(objetivo, u);
        } catch {
            await sock.sendMessage(jid, { text: '❌ No pude expulsar al usuario. Verifica mis permisos de administrador.' });
        }
    }
}

async function cmdWarns(sock, jid, groupMetadata, senderJid, mencionados) {
    if (!esAdmin(groupMetadata, senderJid)) {
        await sock.sendMessage(jid, { text: '❌ Solo los administradores pueden usar este comando.' });
        return;
    }
    const objetivo = mencionados && mencionados.length > 0 ? mencionados[0] : senderJid;
    const u = getUsuario(objetivo);
    const g = getGrupo(jid);
    await sock.sendMessage(jid, {
        text: `⚠️ *Advertencias de @${objetivo.split('@')[0]}*\n🔢 Total: *${u.advertencias || 0}/${g.limiteAdvertencias || 3}*`,
        mentions: [objetivo]
    });
}

async function cmdSetwarnlimit(sock, jid, groupMetadata, senderJid, args) {
    if (!esAdmin(groupMetadata, senderJid)) {
        await sock.sendMessage(jid, { text: '❌ Solo los administradores pueden usar este comando.' });
        return;
    }
    const num = parseInt(args[0]);
    if (isNaN(num) || num < 1) {
        await sock.sendMessage(jid, { text: '❌ Uso: #setwarnlimit <número>' });
        return;
    }
    const g = getGrupo(jid);
    g.limiteAdvertencias = num;
    guardarGrupo(jid, g);
    await sock.sendMessage(jid, { text: `✅ Límite de advertencias establecido en *${num}*` });
}

async function cmdTopmensajes(sock, jid) {
    const db = cargarUsuarios();
    const usuarios = Object.entries(db)
        .map(([jid, u]) => ({ jid, mensajes: u.mensajes || 0 }))
        .sort((a, b) => b.mensajes - a.mensajes)
        .slice(0, 10);
    let texto = '╔══════════════════╗\n║  💬 TOP MENSAJES   ║\n╚══════════════════╝\n\n';
    const medallas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    for (let i = 0; i < usuarios.length; i++) {
        const u = usuarios[i];
        texto += `${medallas[i]} @${u.jid.split('@')[0]} — *${u.mensajes} mensajes*\n`;
    }
    const mentions = usuarios.map(u => u.jid);
    await sock.sendMessage(jid, { text: texto, mentions });
}

module.exports = {
    esAdmin, cmdSetwelcome, cmdSetgoodbye, cmdWelcome, cmdOnlyadmin,
    cmdOpen, cmdWarn, cmdWarns, cmdSetwarnlimit, cmdTopmensajes
};
