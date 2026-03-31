const { Client, LocalAuth } = require('whatsapp-web.js');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('qr', async () => {
    rl.question('📱 Ingresa tu número de WhatsApp (con código de país, sin + ni espacios, ej: 521234567890): ', async (numero) => {
        numero = numero.trim();
        try {
            const codigo = await client.requestPairingCode(numero);
            console.log(`\n✅ Tu código de emparejamiento es: ${codigo}`);
            console.log('👉 Abre WhatsApp > Dispositivos vinculados > Vincular con número de teléfono');
            console.log('   Ingresa el código anterior y espera la conexión...\n');
        } catch (error) {
            console.error('❌ Error al solicitar el código:', error.message);
        }
        rl.close();
    });
});

client.on('ready', () => {
    console.log('✅ Bot conectado y listo!');
});

client.on('auth_failure', () => {
    console.log('❌ Falló la autenticación. Reinicia el bot e intenta de nuevo.');
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
