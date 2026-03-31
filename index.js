const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('qr', (qr) => {
    console.log('Escanea este código QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot conectado y listo!');
});

client.on('message', async (message) => {
    const texto = message.body.toLowerCase();

    if (texto === '!hola') {
        message.reply('¡Hola! Soy un bot de WhatsApp. ¿En qué puedo ayudarte?');
    } else if (texto === '!ayuda') {
        message.reply(
            '📋 *Comandos disponibles:*\n' +
            '!hola - Saludo\n' +
            '!ayuda - Ver comandos\n' +
            '!hora - Ver la hora actual'
        );
    } else if (texto === '!hora') {
        const ahora = new Date().toLocaleString('es-ES', { timeZone: 'America/Mexico_City' });
        message.reply(`🕐 La hora actual es: ${ahora}`);
    }
});

client.initialize();
