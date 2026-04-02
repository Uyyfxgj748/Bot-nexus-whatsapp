const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const path = require('path');

const { manejarMensaje } = require('./src/handler');
const { getGrupo } = require('./src/database');
const { manejarMensajePersonajes } = require('./src/personajes');

function preguntarNumero() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question('📱 Ingresa tu número (con código de país, sin + ni espacios, ej: 521234567890): ', (numero) => {
            rl.close();
            resolve(numero.trim());
        });
    });
}

async function iniciarBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    let codigoSolicitado = false;

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection === 'connecting' && !sock.authState.creds.registered && !codigoSolicitado) {
            codigoSolicitado = true;
            try {
                await new Promise(r => setTimeout(r, 3000));
                const numero = process.env.PHONE_NUMBER || await preguntarNumero();
                const numeroFormateado = numero.replace(/[^0-9]/g, '');
                const codigo = await sock.requestPairingCode(numeroFormateado);
                console.log(`\n✅ Tu código de emparejamiento es: ${codigo}`);
                console.log('👉 Abre WhatsApp > Dispositivos vinculados > Vincular con número de teléfono');
                console.log('   Ingresa el código y espera la conexión...\n');
            } catch (e) {
                console.log('⚠️ Error al solicitar código, reintentando...');
                codigoSolicitado = false;
            }
        } else if (connection === 'open') {
            console.log('✅ ¡Bot conectado y listo! Escribe #menu en WhatsApp para ver los comandos.');
        } else if (connection === 'close') {
            const codigo = lastDisconnect?.error?.output?.statusCode;
            const reconectar = codigo !== DisconnectReason.loggedOut;
            if (reconectar) {
                console.log('🔄 Reconectando...');
                iniciarBot();
            } else {
                console.log('❌ Sesión cerrada. Reinicia el bot.');
            }
        }
    });

    sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
        const g = getGrupo(id);
        if (action === 'add' && g.bienvenida) {
            for (const participante of participants) {
                const mensaje = g.mensajeBienvenida.replace('@usuario', `@${participante.split('@')[0]}`);
                await sock.sendMessage(id, { text: mensaje, mentions: [participante] });
            }
        }
        if (action === 'remove' && g.despedida) {
            for (const participante of participants) {
                const mensaje = g.mensajeDespedida.replace('@usuario', `@${participante.split('@')[0]}`);
                await sock.sendMessage(id, { text: mensaje, mentions: [participante] });
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            let groupMetadata = null;
            if (msg.key.remoteJid.endsWith('@g.us')) {
                try {
                    groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
                } catch {}
            }

            const texto = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
            const comando = texto.startsWith('#') ? texto.slice(1).split(' ')[0].toLowerCase() : '';

            const comandosPersonajes = ['roll','rw','buycharacter','harem','buychar','buyc'];

            if (comandosPersonajes.includes(comando)) {
                await manejarMensajePersonajes(sock, msg);
            } else {
                await manejarMensaje(sock, msg, groupMetadata);
            }
        }
    });
}

iniciarBot();