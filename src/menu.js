async function enviarMenu(sock, jid) {
    const menu = `╔══════════════════════╗
║     🌸 NEKOS BOT 🌸     ║
╚══════════════════════╝

📥 *DESCARGAS*
┣ #yt <link> — Video YouTube
┣ #play <link> — Audio YouTube
┣ #tiktok <link> — Video TikTok
┣ #twitter <link> — Video Twitter/X
┣ #img <link> — Descargar imagen
┗ #sticker — Imagen/video a sticker

🛠️ *UTILIDADES*
┣ #ping — Latencia del bot
┣ #status — Estado del bot
┣ #del — Eliminar mensaje (citar)
┣ #pfp [@user] — Foto de perfil
┣ #tagall [msg] — Mencionar a todos
┗ #toimage — Sticker a imagen

💰 *ECONOMÍA*
┣ #perfil [@user] — Ver perfil
┣ #saldo — Ver tus monedas
┣ #diario — Monedas diarias
┣ #work — Trabajar (cada 2h)
┣ #depositar [cant|all] — Banco
┣ #retirar [cant|all] — Retirar
┣ #ruleta [rojo|negro] [cant]
┣ #robar @user — Intentar robar
┣ #transferir @user cant
┣ #baltop — Top monedas
┣ #tienda — Ver tienda
┣ #comprar <id> — Comprar artículo
┗ #inventario — Tus artículos

👤 *PERFILES*
┣ #setbirth DD/MM/AAAA
┣ #setdesc [descripción]
┣ #setgenre hombre|mujer
┣ #marry @user — Casarse
┣ #divorce — Divorciarse
┣ #level [@user] — Ver nivel
┣ #leaderboard — Top XP
┗ #cumpleanos — Cumpleaños mes

🎮 *INTERACCIONES*
┣ #abrazar @user
┣ #besar @user
┣ #golpear @user
┣ #acariciar @user
┗ #bailar @user

🔞 *ZONA +18*
┣ #neko
┣ #waifu
┗ #hentai

👑 *ADMIN (solo admins)*
┣ #setwelcome [texto]
┣ #setgoodbye [texto]
┣ #welcome enable|disable
┣ #onlyadmin enable|disable
┣ #open — Abrir grupo
┣ #warn @user [razón]
┣ #warns @user
┣ #setwarnlimit <número>
┗ #topmensajes — Top activos

_Bot hecho con ❤️_`;

    await sock.sendMessage(jid, { text: menu });
}

module.exports = { enviarMenu };
