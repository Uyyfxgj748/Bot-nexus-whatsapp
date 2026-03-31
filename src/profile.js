const { getUsuario, guardarUsuario, cargarUsuarios } = require('./database');

async function cmdPerfil(sock, jid, senderJid, mencionados) {
    const objetivo = mencionados && mencionados.length > 0 ? mencionados[0] : senderJid;
    const u = getUsuario(objetivo);
    const generoEmoji = u.genero === 'hombre' ? '♂️' : u.genero === 'mujer' ? '♀️' : '❓';
    const parejaText = u.pareja ? `@${u.pareja.split('@')[0]}` : 'Soltero/a';
    const texto = `╔══════════════════╗
║      👤 PERFIL      ║
╚══════════════════╝
👤 Usuario: @${objetivo.split('@')[0]}
${generoEmoji} Género: *${u.genero || 'No definido'}*
💬 Descripción: _${u.descripcion || 'Sin descripción'}_
💍 Pareja: *${parejaText}*
🎂 Cumpleaños: *${u.cumpleanos || 'No definido'}*
💰 Monedas: *${u.monedas}*
🏦 Banco: *${u.banco || 0}*
⭐ Nivel: *${u.nivel}* (${u.experiencia} XP)
💬 Mensajes: *${u.mensajes || 0}*
🎒 Artículos: *${u.inventario.length}*`;
    await sock.sendMessage(jid, { text: texto, mentions: [objetivo] });
}

async function cmdSetbirth(sock, jid, senderJid, args) {
    const fecha = args[0];
    if (!fecha || !/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
        await sock.sendMessage(jid, { text: '❌ Uso: #setbirth DD/MM/AAAA\nEjemplo: #setbirth 15/03/2000' });
        return;
    }
    const u = getUsuario(senderJid);
    u.cumpleanos = fecha;
    guardarUsuario(senderJid, u);
    await sock.sendMessage(jid, { text: `🎂 Cumpleaños establecido: *${fecha}*` });
}

async function cmdSetdesc(sock, jid, senderJid, args) {
    const desc = args.join(' ');
    if (!desc) {
        await sock.sendMessage(jid, { text: '❌ Uso: #setdesc [descripción]' });
        return;
    }
    const u = getUsuario(senderJid);
    u.descripcion = desc;
    guardarUsuario(senderJid, u);
    await sock.sendMessage(jid, { text: `✅ Descripción actualizada: _${desc}_` });
}

async function cmdSetgenre(sock, jid, senderJid, args) {
    const genero = args[0]?.toLowerCase();
    if (!genero || !['hombre', 'mujer'].includes(genero)) {
        await sock.sendMessage(jid, { text: '❌ Uso: #setgenre hombre | mujer' });
        return;
    }
    const u = getUsuario(senderJid);
    u.genero = genero;
    guardarUsuario(senderJid, u);
    await sock.sendMessage(jid, { text: `✅ Género establecido: *${genero}*` });
}

async function cmdMarry(sock, jid, senderJid, mencionados) {
    if (!mencionados || mencionados.length === 0) {
        await sock.sendMessage(jid, { text: '❌ Uso: #marry @usuario' });
        return;
    }
    const objetivo = mencionados[0];
    if (objetivo === senderJid) {
        await sock.sendMessage(jid, { text: '❌ No puedes casarte contigo mismo.' });
        return;
    }
    const uSender = getUsuario(senderJid);
    const uObjetivo = getUsuario(objetivo);
    if (uSender.pareja) {
        await sock.sendMessage(jid, { text: `❌ Ya estás casado/a con @${uSender.pareja.split('@')[0]}. Usa #divorce primero.`, mentions: [uSender.pareja] });
        return;
    }
    if (uObjetivo.pareja) {
        await sock.sendMessage(jid, { text: `❌ @${objetivo.split('@')[0]} ya está casado/a.`, mentions: [objetivo] });
        return;
    }
    uSender.pareja = objetivo;
    uObjetivo.pareja = senderJid;
    guardarUsuario(senderJid, uSender);
    guardarUsuario(objetivo, uObjetivo);
    await sock.sendMessage(jid, {
        text: `💍 ¡@${senderJid.split('@')[0]} y @${objetivo.split('@')[0]} ahora están casados! 🎊`,
        mentions: [senderJid, objetivo]
    });
}

async function cmdDivorce(sock, jid, senderJid) {
    const u = getUsuario(senderJid);
    if (!u.pareja) {
        await sock.sendMessage(jid, { text: '❌ No estás casado/a.' });
        return;
    }
    const exPareja = u.pareja;
    const uEx = getUsuario(exPareja);
    u.pareja = null;
    uEx.pareja = null;
    guardarUsuario(senderJid, u);
    guardarUsuario(exPareja, uEx);
    await sock.sendMessage(jid, {
        text: `💔 @${senderJid.split('@')[0]} se divorció de @${exPareja.split('@')[0]}`,
        mentions: [senderJid, exPareja]
    });
}

async function cmdLevel(sock, jid, senderJid, mencionados) {
    const objetivo = mencionados && mencionados.length > 0 ? mencionados[0] : senderJid;
    const u = getUsuario(objetivo);
    const expParaSiguiente = u.nivel * 100;
    const barra = '█'.repeat(Math.floor((u.experiencia / expParaSiguiente) * 10)) + '░'.repeat(10 - Math.floor((u.experiencia / expParaSiguiente) * 10));
    await sock.sendMessage(jid, {
        text: `⭐ *Nivel de @${objetivo.split('@')[0]}*\n\n🎯 Nivel: *${u.nivel}*\n📊 XP: ${u.experiencia}/${expParaSiguiente}\n[${barra}]`,
        mentions: [objetivo]
    });
}

async function cmdLeaderboard(sock, jid) {
    const db = cargarUsuarios();
    const usuarios = Object.entries(db)
        .map(([jid, u]) => ({ jid, nivel: u.nivel || 1, exp: u.experiencia || 0 }))
        .sort((a, b) => b.nivel !== a.nivel ? b.nivel - a.nivel : b.exp - a.exp)
        .slice(0, 10);
    let texto = '╔══════════════════╗\n║   🏆 LEADERBOARD   ║\n╚══════════════════╝\n\n';
    const medallas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    for (let i = 0; i < usuarios.length; i++) {
        const u = usuarios[i];
        texto += `${medallas[i]} @${u.jid.split('@')[0]} — Nivel *${u.nivel}*\n`;
    }
    const mentions = usuarios.map(u => u.jid);
    await sock.sendMessage(jid, { text: texto, mentions });
}

async function cmdCumpleanos(sock, jid) {
    const db = cargarUsuarios();
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const proximos = Object.entries(db)
        .filter(([, u]) => u.cumpleanos)
        .map(([jid, u]) => {
            const [d, m] = u.cumpleanos.split('/');
            return { jid, dia: d, mes: m, cumpleanos: u.cumpleanos };
        })
        .filter(u => u.mes === mes);
    if (proximos.length === 0) {
        await sock.sendMessage(jid, { text: '🎂 No hay cumpleaños este mes.' });
        return;
    }
    let texto = `╔══════════════════╗\n║  🎂 CUMPLEAÑOS    ║\n╚══════════════════╝\n\n`;
    for (const u of proximos) {
        const esHoy = u.dia === dia ? ' ← ¡HOY! 🎉' : '';
        texto += `🎂 @${u.jid.split('@')[0]} — ${u.cumpleanos}${esHoy}\n`;
    }
    const mentions = proximos.map(u => u.jid);
    await sock.sendMessage(jid, { text: texto, mentions });
}

module.exports = {
    cmdPerfil, cmdSetbirth, cmdSetdesc, cmdSetgenre,
    cmdMarry, cmdDivorce, cmdLevel, cmdLeaderboard, cmdCumpleanos
};
