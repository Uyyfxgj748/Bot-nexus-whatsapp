# Nexus Bot - WhatsApp

Bot de WhatsApp completo con múltiples funciones, construido con Node.js y Baileys.

## Cómo iniciar

1. Ejecuta el proyecto
2. Si no hay sesión guardada, ingresa tu número con código de país (ej: 521234567890)
3. Ingresa el código en WhatsApp > Dispositivos vinculados > Vincular con número de teléfono
4. Escribe `!menu` en WhatsApp para ver todos los comandos

## Comandos disponibles

### Descargas
- `!yt <link>` — Descargar video de YouTube (máx 5 min)
- `!tiktok <link>` — Descargar video de TikTok sin marca de agua
- `!img <link>` — Descargar imagen desde URL
- `!sticker` — Convertir imagen/video a sticker (responde a un mensaje)

### Economía
- `!perfil` — Ver tu perfil (monedas, nivel, inventario)
- `!saldo` — Ver cuántas monedas tienes
- `!diario` — Recoger monedas diarias (recarga cada 24h)
- `!transferir @user cantidad` — Enviar monedas a otro usuario
- `!tienda` — Ver artículos disponibles
- `!comprar <id>` — Comprar un artículo de la tienda
- `!inventario` — Ver tus artículos

### Interacciones
- `!abrazar @user` — Abrazar a alguien
- `!besar @user` — Besar a alguien
- `!golpear @user` — Golpear a alguien
- `!acariciar @user` — Acariciar a alguien
- `!bailar @user` — Bailar con alguien

### +18
- `!neko` — Imagen neko +18
- `!waifu` — Imagen waifu +18
- `!hentai` — Imagen hentai

## Estructura del proyecto

```
index.js          — Punto de entrada del bot
src/
  handler.js      — Enrutador de comandos
  menu.js         — Comando de menú
  economy.js      — Sistema de economía
  interactions.js — Interacciones SFW y NSFW
  sticker.js      — Conversión de stickers
  downloads.js    — Descarga de videos/imágenes
  database.js     — Base de datos JSON
data/
  users.json      — Datos de usuarios (generado automáticamente)
  tienda.json     — Artículos de la tienda
auth_info/        — Sesión de WhatsApp (generado automáticamente)
```

## Dependencias principales

- `@whiskeysockets/baileys` — Conexión con WhatsApp
- `sharp` — Procesamiento de imágenes para stickers
- `fluent-ffmpeg` — Conversión de videos a stickers
- `ytdl-core` — Descarga de YouTube
- `axios` — Peticiones HTTP
- `fs-extra` — Manejo de archivos
