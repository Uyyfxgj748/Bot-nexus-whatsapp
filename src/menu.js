async function enviarMenu(sock, jid) {
    const menu = `╔══════════════════════╗
║     🌸 NEKOS BOT 🌸     ║
╚══════════════════════╝

📥 *DESCARGAS*
┣ !yt <link> — Descargar YouTube
┣ !tiktok <link> — Descargar TikTok
┣ !img <link> — Descargar imagen
┗ !sticker — Convertir imagen a sticker
   _(responde una imagen)_

💰 *ECONOMÍA*
┣ !perfil — Ver tu perfil
┣ !saldo — Ver tus monedas
┣ !diario — Recibir monedas diarias
┣ !transferir @user cant — Transferir monedas
┣ !tienda — Ver la tienda
┣ !comprar <id> — Comprar un artículo
┗ !inventario — Ver tus artículos

🎮 *INTERACCIONES*
┣ !abrazar @user
┣ !besar @user
┣ !golpear @user
┣ !acariciar @user
┗ !bailar @user

🔞 *ZONA +18* _(solo grupos adultos)_
┣ !neko
┣ !waifu
┗ !hentai

❓ !menu — Ver este menú

_Bot hecho con ❤️_`;

    await sock.sendMessage(jid, { text: menu });
}

module.exports = { enviarMenu };
