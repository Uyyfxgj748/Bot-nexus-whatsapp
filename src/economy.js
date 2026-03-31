const { getUsuario, guardarUsuario, agregarMonedas, quitarMonedas, cargarUsuarios } = require('./database');
const fs = require('fs-extra');
const path = require('path');

const TIENDA_PATH = path.join(__dirname, '../data/tienda.json');

function getTienda() {
    return fs.readJsonSync(TIENDA_PATH);
}

async function cmdPerfil(sock, jid, senderJid) {
    const u = getUsuario(senderJid);
    const texto = `╔══════════════════╗
║      👤 PERFIL      ║
╚══════════════════╝
💰 Monedas: *${u.monedas}*
⭐ Nivel: *${u.nivel}*
🧪 Experiencia: *${u.experiencia}*
🎒 Artículos: *${u.inventario.length}*`;
    await sock.sendMessage(jid, { text: texto });
}

async function cmdSaldo(sock, jid, senderJid) {
    const u = getUsuario(senderJid);
    await sock.sendMessage(jid, { text: `💰 Tienes *${u.monedas} monedas*` });
}

async function cmdDiario(sock, jid, senderJid) {
    const u = getUsuario(senderJid);
    const ahora = Date.now();
    const un_dia = 24 * 60 * 60 * 1000;

    if (u.ultimoDiario && ahora - u.ultimoDiario < un_dia) {
        const restante = un_dia - (ahora - u.ultimoDiario);
        const horas = Math.floor(restante / 3600000);
        const minutos = Math.floor((restante % 3600000) / 60000);
        await sock.sendMessage(jid, { text: `⏳ Ya recogiste tu diario. Vuelve en *${horas}h ${minutos}m*` });
        return;
    }

    const ganadas = Math.floor(Math.random() * 200) + 100;
    u.monedas += ganadas;
    u.ultimoDiario = ahora;
    guardarUsuario(senderJid, u);
    await sock.sendMessage(jid, { text: `🎁 ¡Recibiste *${ganadas} monedas* de tu recompensa diaria!\n💰 Total: *${u.monedas} monedas*` });
}

async function cmdTransferir(sock, jid, senderJid, mensaje, mencionados) {
    const partes = mensaje.split(' ');
    if (!mencionados || mencionados.length === 0 || partes.length < 3) {
        await sock.sendMessage(jid, { text: '❌ Uso: !transferir @usuario cantidad' });
        return;
    }
    const destinoJid = mencionados[0];
    const cantidad = parseInt(partes[partes.length - 1]);
    if (isNaN(cantidad) || cantidad <= 0) {
        await sock.sendMessage(jid, { text: '❌ Ingresa una cantidad válida' });
        return;
    }
    if (!quitarMonedas(senderJid, cantidad)) {
        await sock.sendMessage(jid, { text: '❌ No tienes suficientes monedas' });
        return;
    }
    agregarMonedas(destinoJid, cantidad);
    await sock.sendMessage(jid, { text: `✅ Transferiste *${cantidad} monedas* correctamente` });
}

async function cmdTienda(sock, jid) {
    const items = getTienda();
    let texto = '╔══════════════════╗\n║      🛒 TIENDA      ║\n╚══════════════════╝\n\n';
    for (const item of items) {
        texto += `${item.emoji} *${item.nombre}* (ID: ${item.id})\n`;
        texto += `   📝 ${item.descripcion}\n`;
        texto += `   💰 Precio: ${item.precio} monedas\n\n`;
    }
    texto += '👉 Usa *!comprar <id>* para adquirir un artículo';
    await sock.sendMessage(jid, { text: texto });
}

async function cmdComprar(sock, jid, senderJid, args) {
    const id = parseInt(args[0]);
    const items = getTienda();
    const item = items.find(i => i.id === id);
    if (!item) {
        await sock.sendMessage(jid, { text: '❌ Artículo no encontrado. Usa !tienda para ver los artículos.' });
        return;
    }
    const u = getUsuario(senderJid);
    if (u.monedas < item.precio) {
        await sock.sendMessage(jid, { text: `❌ No tienes suficientes monedas. Necesitas *${item.precio}* y tienes *${u.monedas}*` });
        return;
    }
    if (u.inventario.find(i => i.id === id)) {
        await sock.sendMessage(jid, { text: '❌ Ya tienes este artículo en tu inventario' });
        return;
    }
    u.monedas -= item.precio;
    u.inventario.push({ id: item.id, nombre: item.nombre, emoji: item.emoji, tipo: item.tipo });
    guardarUsuario(senderJid, u);
    await sock.sendMessage(jid, { text: `✅ ¡Compraste *${item.emoji} ${item.nombre}* por *${item.precio} monedas*!\n💰 Saldo restante: *${u.monedas} monedas*` });
}

async function cmdInventario(sock, jid, senderJid) {
    const u = getUsuario(senderJid);
    if (u.inventario.length === 0) {
        await sock.sendMessage(jid, { text: '🎒 Tu inventario está vacío. Usa !tienda para comprar artículos.' });
        return;
    }
    let texto = '╔══════════════════╗\n║    🎒 INVENTARIO    ║\n╚══════════════════╝\n\n';
    for (const item of u.inventario) {
        texto += `${item.emoji} *${item.nombre}* (${item.tipo})\n`;
    }
    await sock.sendMessage(jid, { text: texto });
}

module.exports = { cmdPerfil, cmdSaldo, cmdDiario, cmdTransferir, cmdTienda, cmdComprar, cmdInventario };
