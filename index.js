const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

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

    if (!sock.authState.creds.registered) {
        const numero = await preguntarNumero();
        const numeroFormateado = numero.replace(/[^0-9]/g, '');

        const codigo = await sock.requestPairingCode(numeroFormateado);
        console.log(`\n✅ Tu código de emparejamiento es: ${codigo}`);
        console.log('👉 Abre WhatsApp > Dispositivos vinculados > Vincular con número de teléfono');
        console.log('   Ingresa el código y espera la conexión...\n');
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'open') {
            console.log('✅ Bot conectado y listo!');
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

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message || msg.key.fromMe) continue;

            const texto = (
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                ''
            ).toLowerCase().trim();

            const jid = msg.key.remoteJid;

            if (texto === '!hola') {
                await sock.sendMessage(jid, { text: '¡Hola! Soy un bot de WhatsApp. ¿En qué puedo ayudarte?' });
            } else if (texto === '!ayuda') {
                await sock.sendMessage(jid, {
                    text: '📋 *Comandos disponibles:*\n!hola - Saludo\n!ayuda - Ver comandos\n!hora - Ver la hora actual'
                });
            } else if (texto === '!hora') {
                const ahora = new Date().toLocaleString('es-ES', { timeZone: 'America/Mexico_City' });
                await sock.sendMessage(jid, { text: `🕐 La hora actual es: ${ahora}` });
            }
        }
    });
}

iniciarBot();
