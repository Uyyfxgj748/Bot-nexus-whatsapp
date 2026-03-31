# Bot de WhatsApp

Bot de WhatsApp construido con Node.js y la librería `whatsapp-web.js`.

## Cómo usar

1. Ejecuta el proyecto (workflow: "Start application")
2. Escanea el código QR que aparece en la consola con tu WhatsApp
   - Abre WhatsApp en tu teléfono
   - Ve a Configuración > Dispositivos vinculados > Vincular un dispositivo
   - Escanea el código QR
3. Una vez conectado, el bot responderá mensajes

## Comandos disponibles

- `!hola` - El bot responde con un saludo
- `!ayuda` - Muestra la lista de comandos
- `!hora` - Muestra la hora actual

## Estructura del proyecto

- `index.js` - Archivo principal del bot
- `package.json` - Dependencias del proyecto

## Dependencias

- `whatsapp-web.js` - Librería para conectar con WhatsApp
- `qrcode-terminal` - Para mostrar el QR en la consola

## Notas

- La sesión se guarda automáticamente en `.wwebjs_auth/` por lo que no necesitas escanear el QR cada vez
- El bot usa Chromium del sistema para funcionar
