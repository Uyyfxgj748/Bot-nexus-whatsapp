const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const personajesPath = path.join(__dirname, '../src/personajes.json');

// 📦 Cargar datos
function cargarJSON(ruta) {
    if (!fs.existsSync(ruta)) return {};
    return JSON.parse(fs.readFileSync(ruta));
}

function guardarJSON(ruta, data) {
    fs.writeFileSync(ruta, JSON.stringify(data, null, 2));
}

// ⏳ Formatear tiempo
function msToTime(ms) {
    let segundos = Math.floor((ms / 1000) % 60);
    let minutos = Math.floor((ms / (1000 * 60)) % 60);

    return `${minutos}m ${segundos}s`;
}

// 📊 Barra visual
function barraCooldown(restante, total) {
    const totalBars = 10;
    const progreso = total - restante;
    const llenos = Math.round((progreso / total) * totalBars);

    return '🟩'.repeat(llenos) + '⬜'.repeat(totalBars - llenos);
}

// 🎮 Handler principal
async function manejarMensajePersonajes(sock, msg) {
    const texto = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
    if (!texto.startsWith('#')) return;

    const jid = msg.key.remoteJid;
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

    const parts = texto.slice(1).trim().split(/\s+/);
    const cmd = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    let usuarios = cargarJSON(usersPath);
    let data = cargarJSON(personajesPath);
    let lista = data.personajes;

    // 🧑 Crear usuario si no existe
    if (!usuarios[sender]) {
        usuarios[sender] = {
            monedas: 10000,
            harem: [],
            cooldowns: {}
        };
    }

    if (!usuarios[sender].harem) usuarios[sender].harem = [];
    if (!usuarios[sender].cooldowns) usuarios[sender].cooldowns = {};
    if (!usuarios[sender].monedas) usuarios[sender].monedas = 0;

    const cooldownTiempo = 5 * 60 * 1000; // 5 min

    switch (cmd) {

        // 🎲 RANDOM WAIFU
        case 'rw':
        case 'roll': {
            const ahora = Date.now();
            const ultimo = usuarios[sender].cooldowns.rw || 0;

            if (ahora - ultimo < cooldownTiempo) {
                const restante = cooldownTiempo - (ahora - ultimo);
                return sock.sendMessage(jid, {
                    text: `⏳ Espera ${msToTime(restante)}\n${barraCooldown(restante, cooldownTiempo)}`
                });
            }

            const personaje = lista[Math.floor(Math.random() * lista.length)];

            usuarios[sender].cooldowns.rw = ahora;
            guardarJSON(usersPath, usuarios);

            const imgPath = path.join(__dirname, 'img', personaje.imagen);

            await sock.sendMessage(jid, {
                image: fs.readFileSync(imgPath),
                caption:
`🎴 *${personaje.nombre}*
📺 Serie: ${personaje.serie}
⚧ Género: ${personaje.genero}
💰 Valor: ${personaje.valor} monedas

🛒 Usa #buychar ${personaje.nombre}`
            });
            break;
        }

        // 🛒 COMPRAR PERSONAJE
        case 'buychar':
        case 'buyc': {
            const ahora = Date.now();
            const ultimo = usuarios[sender].cooldowns.buy || 0;

            if (ahora - ultimo < cooldownTiempo) {
                const restante = cooldownTiempo - (ahora - ultimo);
                return sock.sendMessage(jid, {
                    text: `⏳ Espera ${msToTime(restante)}\n${barraCooldown(restante, cooldownTiempo)}`
                });
            }

            const nombre = args.join(' ');
            if (!nombre) {
                return sock.sendMessage(jid, { text: '❌ Escribe el nombre del personaje' });
            }

            const personaje = lista.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
            if (!personaje) {
                return sock.sendMessage(jid, { text: '❌ Personaje no encontrado' });
            }

            if (usuarios[sender].harem.includes(personaje.nombre)) {
                return sock.sendMessage(jid, { text: '⚠️ Ya tienes este personaje' });
            }

            if (usuarios[sender].monedas < personaje.valor) {
                return sock.sendMessage(jid, { text: '💸 No tienes monedas suficientes' });
            }

            usuarios[sender].monedas -= personaje.valor;
            usuarios[sender].harem.push(personaje.nombre);
            usuarios[sender].cooldowns.buy = ahora;

            guardarJSON(usersPath, usuarios);

            await sock.sendMessage(jid, {
                text: `✅ Compraste a *${personaje.nombre}*\n💰 Te quedan: ${usuarios[sender].monedas} monedas`
            });

            break;
        }

        // 🎴 VER HAREM
        case 'harem': {
            const harem = usuarios[sender].harem;

            if (!harem || harem.length === 0) {
                return sock.sendMessage(jid, {
                    text: '💔 No tienes personajes... usa #rw 😏'
                });
            }

            let textoHarem = '🎴 *TU HAREM* 🎴\n\n';

            harem.forEach((p, i) => {
                textoHarem += `✨ ${i + 1}. ${p}\n`;
            });

            textoHarem += `\n💎 Total: ${harem.length}`;

            await sock.sendMessage(jid, { text: textoHarem });
            break;
        }
    }
}

module.exports = { manejarMensajePersonajes };