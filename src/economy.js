const { getUsuario, guardarUsuario, agregarMonedas, quitarMonedas, cargarUsuarios } = require('./database');
const fs = require('fs-extra');
const path = require('path');

const TIENDA_PATH = path.join(__dirname, '../data/tienda.json');

function getTienda() {
    return fs.readJsonSync(TIENDA_PATH);
}

async function cmdSaldo(sock, jid, senderJid) {
    const u = getUsuario(senderJid);
    await sock.sendMessage(jid, {
        text: `💰 *Tus monedas*\n\n👛 Cartera: *${u.monedas} coins*\n🏦 Banco: *${u.banco || 0} coins*\n💎 Total: *${u.monedas + (u.banco || 0)} coins*`
    });
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
    await sock.sendMessage(jid, { text: `🎁 ¡Recibiste *${ganadas} coins* de tu recompensa diaria!\n💰 Total: *${u.monedas} coins*` });
}

async function cmdWork(sock, jid, senderJid) {
    const u = getUsuario(senderJid);
    const ahora = Date.now();
    const espera = 2 * 60 * 60 * 1000;
    if (u.ultimoTrabajo && ahora - u.ultimoTrabajo < espera) {
        const restante = espera - (ahora - u.ultimoTrabajo);
        const horas = Math.floor(restante / 3600000);
        const minutos = Math.floor((restante % 3600000) / 60000);
        await sock.sendMessage(jid, { text: `⏳ Ya trabajaste. Descansa y vuelve en *${horas}h ${minutos}m*` });
        return;
    }
    const trabajos = [
        { trabajo: 'programador', ganancia: Math.floor(Math.random() * 150) + 100 },
        { trabajo: 'chef', ganancia: Math.floor(Math.random() * 120) + 80 },
        { trabajo: 'médico', ganancia: Math.floor(Math.random() * 200) + 150 },
        { trabajo: 'maestro', ganancia: Math.floor(Math.random() * 100) + 70 },
        { trabajo: 'diseñador', ganancia: Math.floor(Math.random() * 130) + 90 },
        { trabajo: 'streamer', ganancia: Math.floor(Math.random() * 180) + 50 },
        { trabajo: 'agricultor', ganancia: Math.floor(Math.random() * 90) + 60 },
        { trabajo: 'mecánico', ganancia: Math.floor(Math.random() * 110) + 75 },
        { trabajo: 'youtuber', ganancia: Math.floor(Math.random() * 160) + 40 },
        { trabajo: 'abogado', ganancia: Math.floor(Math.random() * 220) + 130 },
    ];
    const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)];
    u.monedas += trabajo.ganancia;
    u.ultimoTrabajo = ahora;
    guardarUsuario(senderJid, u);
    await sock.sendMessage(jid, {
        text: `💼 Trabajaste como *${trabajo.trabajo}* y ganaste *${trabajo.ganancia} coins*!\n💰 Total: *${u.monedas} coins*`
    });
}

async function cmdCrime(sock, jid, senderJid) {
    const u = getUsuario(senderJid);
    const ahora = Date.now();
    const espera = 30 * 60 * 1000;
    if (u.ultimoCrimen && ahora - u.ultimoCrimen < espera) {
        const restante = espera - (ahora - u.ultimoCrimen);
        const minutos = Math.floor(restante / 60000);
        const segundos = Math.floor((restante % 60000) / 1000);
        await sock.sendMessage(jid, { text: `⏳ Deja que la policía se calme. Vuelve en *${minutos}m ${segundos}s*` });
        return;
    }
    const exito = Math.random() < 0.6;
    u.ultimoCrimen = ahora;
    if (exito) {
        const crimenes = [
            { acto: 'asaltaste una tienda', ganancia: Math.floor(Math.random() * 400) + 200 },
            { acto: 'hackeaste una cuenta bancaria', ganancia: Math.floor(Math.random() * 600) + 300 },
            { acto: 'robaste un banco', ganancia: Math.floor(Math.random() * 800) + 400 },
            { acto: 'vendiste mercancía robada', ganancia: Math.floor(Math.random() * 300) + 150 },
            { acto: 'estafaste a un turista', ganancia: Math.floor(Math.random() * 250) + 100 },
        ];
        const crimen = crimenes[Math.floor(Math.random() * crimenes.length)];
        u.monedas += crimen.ganancia;
        guardarUsuario(senderJid, u);
        await sock.sendMessage(jid, {
            text: `🦹 ¡Éxito! *${crimen.acto}* y ganaste *${crimen.ganancia} coins*!\n💰 Total: *${u.monedas} coins*`
        });
    } else {
        const multas = [
            'te atrapó la policía y pagaste una fianza',
            'un testigo te vio y te denunció',
            'fallaste en el intento y te multaron',
        ];
        const multa = Math.floor(Math.random() * 200) + 50;
        const motivo = multas[Math.floor(Math.random() * multas.length)];
        u.monedas = Math.max(0, u.monedas - multa);
        guardarUsuario(senderJid, u);
        await sock.sendMessage(jid, {
            text: `🚨 ¡Te atraparon! *${motivo}* y perdiste *${multa} coins*\n💰 Total: *${u.monedas} coins*`
        });
    }
}

async function cmdSlut(sock, jid, senderJid) {
    const u = getUsuario(senderJid);
    const ahora = Date.now();
    const espera = 45 * 60 * 1000;
    if (u.ultimoSlut && ahora - u.ultimoSlut < espera) {
        const restante = espera - (ahora - u.ultimoSlut);
        const minutos = Math.floor(restante / 60000);
        await sock.sendMessage(jid, { text: `⏳ Necesitas descansar. Vuelve en *${minutos}m*` });
        return;
    }
    const exito = Math.random() < 0.7;
    u.ultimoSlut = ahora;
    if (exito) {
        const ganancia = Math.floor(Math.random() * 300) + 100;
        const acciones = [
            `te ganaste *${ganancia} coins* en una noche loca`,
            `un cliente generoso te dio *${ganancia} coins* de propina`,
            `hiciste un show privado y te pagaron *${ganancia} coins*`,
        ];
        const accion = acciones[Math.floor(Math.random() * acciones.length)];
        u.monedas += ganancia;
        guardarUsuario(senderJid, u);
        await sock.sendMessage(jid, { text: `💃 ¡${accion}!\n💰 Total: *${u.monedas} coins*` });
    } else {
        const perdida = Math.floor(Math.random() * 100) + 20;
        u.monedas = Math.max(0, u.monedas - perdida);
        guardarUsuario(senderJid, u);
        await sock.sendMessage(jid, { text: `😞 No hubo clientes hoy y perdiste *${perdida} coins* en gastos\n💰 Total: *${u.monedas} coins*` });
    }
}

async function cmdCoinflip(sock, jid, senderJid, args) {
    const cantidad = parseInt(args[0]);
    const eleccion = args[1]?.toLowerCase();
    if (isNaN(cantidad) || cantidad <= 0 || !['cara', 'cruz', 'heads', 'tails'].includes(eleccion)) {
        await sock.sendMessage(jid, { text: '❌ Uso: *#coinflip [cantidad] [cara/cruz]*\nEjemplo: #coinflip 100 cara' });
        return;
    }
    const u = getUsuario(senderJid);
    if (u.monedas < cantidad) {
        await sock.sendMessage(jid, { text: '❌ No tienes suficientes coins.' });
        return;
    }
    const esCara = ['cara', 'heads'].includes(eleccion);
    const resultado = Math.random() < 0.5 ? 'cara' : 'cruz';
    const gano = (esCara && resultado === 'cara') || (!esCara && resultado === 'cruz');
    if (gano) {
        u.monedas += cantidad;
        guardarUsuario(senderJid, u);
        await sock.sendMessage(jid, {
            text: `🪙 La moneda cayó en *${resultado}* ${resultado === 'cara' ? '😎' : '🔄'}\n✅ ¡Ganaste *${cantidad} coins*!\n💰 Total: *${u.monedas}*`
        });
    } else {
        u.monedas -= cantidad;
        guardarUsuario(senderJid, u);
        await sock.sendMessage(jid, {
            text: `🪙 La moneda cayó en *${resultado}* ${resultado === 'cara' ? '😎' : '🔄'}\n❌ Perdiste *${cantidad} coins*\n💰 Total: *${u.monedas}*`
        });
    }
}

async function cmdDeposit(sock, jid, senderJid, args) {
    const u = getUsuario(senderJid);
    let cantidad;
    if (args[0] === 'all') {
        cantidad = u.monedas;
    } else {
        cantidad = parseInt(args[0]);
    }
    if (isNaN(cantidad) || cantidad <= 0) {
        await sock.sendMessage(jid, { text: '❌ Uso: #depositar [cantidad | all]' });
        return;
    }
    if (u.monedas < cantidad) {
        await sock.sendMessage(jid, { text: '❌ No tienes suficientes coins en tu cartera.' });
        return;
    }
    u.monedas -= cantidad;
    u.banco = (u.banco || 0) + cantidad;
    guardarUsuario(senderJid, u);
    await sock.sendMessage(jid, { text: `🏦 Depositaste *${cantidad} coins* en el banco.\n💰 Cartera: *${u.monedas}* | 🏦 Banco: *${u.banco}*` });
}

async function cmdWithdraw(sock, jid, senderJid, args) {
    const u = getUsuario(senderJid);
    let cantidad;
    if (args[0] === 'all') {
        cantidad = u.banco || 0;
    } else {
        cantidad = parseInt(args[0]);
    }
    if (isNaN(cantidad) || cantidad <= 0) {
        await sock.sendMessage(jid, { text: '❌ Uso: #retirar [cantidad | all]' });
        return;
    }
    if ((u.banco || 0) < cantidad) {
        await sock.sendMessage(jid, { text: '❌ No tienes suficientes coins en el banco.' });
        return;
    }
    u.banco -= cantidad;
    u.monedas += cantidad;
    guardarUsuario(senderJid, u);
    await sock.sendMessage(jid, { text: `💸 Retiraste *${cantidad} coins* del banco.\n💰 Cartera: *${u.monedas}* | 🏦 Banco: *${u.banco}*` });
}

async function cmdRoulette(sock, jid, senderJid, args) {
    const color = args[0]?.toLowerCase();
    const cantidad = parseInt(args[1]);
    if (!color || !['rojo', 'negro', 'red', 'black'].includes(color) || isNaN(cantidad) || cantidad <= 0) {
        await sock.sendMessage(jid, { text: '❌ Uso: #ruleta [rojo|negro] [cantidad]\nEjemplo: #ruleta rojo 100' });
        return;
    }
    const u = getUsuario(senderJid);
    if (u.monedas < cantidad) {
        await sock.sendMessage(jid, { text: '❌ No tienes suficientes coins.' });
        return;
    }
    const esRojo = ['rojo', 'red'].includes(color);
    const resultado = Math.random() < 0.5 ? 'rojo' : 'negro';
    const gano = (esRojo && resultado === 'rojo') || (!esRojo && resultado === 'negro');
    if (gano) {
        u.monedas += cantidad;
        guardarUsuario(senderJid, u);
        await sock.sendMessage(jid, { text: `🎰 La ruleta cayó en *${resultado}* ${resultado === 'rojo' ? '🔴' : '⚫'}\n✅ ¡Ganaste *${cantidad} coins*!\n💰 Total: *${u.monedas}*` });
    } else {
        u.monedas -= cantidad;
        guardarUsuario(senderJid, u);
        await sock.sendMessage(jid, { text: `🎰 La ruleta cayó en *${resultado}* ${resultado === 'rojo' ? '🔴' : '⚫'}\n❌ Perdiste *${cantidad} coins*\n💰 Total: *${u.monedas}*` });
    }
}

async function cmdSteal(sock, jid, senderJid, mencionados) {
    if (!mencionados || mencionados.length === 0) {
        await sock.sendMessage(jid, { text: '❌ Uso: #robar @usuario' });
        return;
    }
    const objetivo = mencionados[0];
    if (objetivo === senderJid) {
        await sock.sendMessage(jid, { text: '❌ No puedes robarte a ti mismo.' });
        return;
    }
    const uSender = getUsuario(senderJid);
    const uObjetivo = getUsuario(objetivo);
    if (uObjetivo.monedas < 50) {
        await sock.sendMessage(jid, { text: `❌ @${objetivo.split('@')[0]} no tiene suficientes coins para robar.`, mentions: [objetivo] });
        return;
    }
    const exito = Math.random() < 0.45;
    if (exito) {
        const robado = Math.floor(Math.random() * Math.min(uObjetivo.monedas * 0.3, 300)) + 20;
        uSender.monedas += robado;
        uObjetivo.monedas -= robado;
        guardarUsuario(senderJid, uSender);
        guardarUsuario(objetivo, uObjetivo);
        await sock.sendMessage(jid, {
            text: `🦹 ¡Robaste *${robado} coins* a @${objetivo.split('@')[0]}!\n💰 Tus coins: *${uSender.monedas}*`,
            mentions: [objetivo]
        });
    } else {
        const multa = Math.floor(Math.random() * 100) + 30;
        uSender.monedas = Math.max(0, uSender.monedas - multa);
        guardarUsuario(senderJid, uSender);
        await sock.sendMessage(jid, {
            text: `🚨 ¡Te atraparon intentando robar a @${objetivo.split('@')[0]}!\n❌ Pagaste una multa de *${multa} coins*\n💰 Tus coins: *${uSender.monedas}*`,
            mentions: [objetivo]
        });
    }
}

async function cmdTransferir(sock, jid, senderJid, mencionados, args) {
    if (!mencionados || mencionados.length === 0) {
        await sock.sendMessage(jid, { text: '❌ Uso: #pay @usuario cantidad' });
        return;
    }
    const destinoJid = mencionados[0];
    const cantidad = parseInt(args.find(a => !isNaN(parseInt(a))));
    if (isNaN(cantidad) || cantidad <= 0) {
        await sock.sendMessage(jid, { text: '❌ Ingresa una cantidad válida.' });
        return;
    }
    if (!quitarMonedas(senderJid, cantidad)) {
        await sock.sendMessage(jid, { text: '❌ No tienes suficientes coins.' });
        return;
    }
    agregarMonedas(destinoJid, cantidad);
    await sock.sendMessage(jid, {
        text: `✅ Enviaste *${cantidad} coins* a @${destinoJid.split('@')[0]}`,
        mentions: [destinoJid]
    });
}

async function cmdBaltop(sock, jid) {
    const db = cargarUsuarios();
    const usuarios = Object.entries(db)
        .map(([jid, u]) => ({ jid, total: (u.monedas || 0) + (u.banco || 0) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    let texto = '╔══════════════════╗\n║  💰 TOP COINS      ║\n╚══════════════════╝\n\n';
    const medallas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    for (let i = 0; i < usuarios.length; i++) {
        const u = usuarios[i];
        texto += `${medallas[i]} @${u.jid.split('@')[0]} — *${u.total} coins*\n`;
    }
    const mentions = usuarios.map(u => u.jid);
    await sock.sendMessage(jid, { text: texto, mentions });
}

async function cmdTienda(sock, jid) {
    const items = getTienda();
    let texto = '╔══════════════════╗\n║      🛒 TIENDA      ║\n╚══════════════════╝\n\n';
    for (const item of items) {
        texto += `${item.emoji} *${item.nombre}* (ID: ${item.id})\n`;
        texto += `   📝 ${item.descripcion}\n`;
        texto += `   💰 Precio: ${item.precio} coins\n\n`;
    }
    texto += '👉 Usa *#comprar <id>* para adquirir un artículo';
    await sock.sendMessage(jid, { text: texto });
}

async function cmdComprar(sock, jid, senderJid, args) {
    const id = parseInt(args[0]);
    const items = getTienda();
    const item = items.find(i => i.id === id);
    if (!item) {
        await sock.sendMessage(jid, { text: '❌ Artículo no encontrado. Usa #tienda para ver los artículos.' });
        return;
    }
    const u = getUsuario(senderJid);
    if (u.monedas < item.precio) {
        await sock.sendMessage(jid, { text: `❌ No tienes suficientes coins. Necesitas *${item.precio}* y tienes *${u.monedas}*` });
        return;
    }
    if (u.inventario.find(i => i.id === id)) {
        await sock.sendMessage(jid, { text: '❌ Ya tienes este artículo en tu inventario.' });
        return;
    }
    u.monedas -= item.precio;
    u.inventario.push({ id: item.id, nombre: item.nombre, emoji: item.emoji, tipo: item.tipo });
    guardarUsuario(senderJid, u);
    await sock.sendMessage(jid, { text: `✅ ¡Compraste *${item.emoji} ${item.nombre}* por *${item.precio} coins*!\n💰 Saldo restante: *${u.monedas} coins*` });
}

async function cmdInventario(sock, jid, senderJid) {
    const u = getUsuario(senderJid);
    if (u.inventario.length === 0) {
        await sock.sendMessage(jid, { text: '🎒 Tu inventario está vacío. Usa #tienda para comprar artículos.' });
        return;
    }
    let texto = '╔══════════════════╗\n║    🎒 INVENTARIO    ║\n╚══════════════════╝\n\n';
    for (const item of u.inventario) {
        texto += `${item.emoji} *${item.nombre}* (${item.tipo})\n`;
    }
    await sock.sendMessage(jid, { text: texto });
}

module.exports = {
    cmdSaldo, cmdDiario, cmdWork, cmdCrime, cmdSlut, cmdCoinflip,
    cmdDeposit, cmdWithdraw, cmdRoulette, cmdSteal, cmdTransferir,
    cmdBaltop, cmdTienda, cmdComprar, cmdInventario
};
