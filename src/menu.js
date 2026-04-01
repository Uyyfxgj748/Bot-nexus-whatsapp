async function enviarMenu(sock, jid) {
    const menu = `╔══════════════════════╗
║   ⚡ NEXUS BOT 😈 ⚡   ║
╚══════════════════════╝

🎰 *ECONOMÍA*
┣ #balance | #bal | #coins — Ver tus coins
┣ #daily | #diario — Recompensa diaria
┣ #work | #w — Trabajar (c/2h)
┣ #crime — Cometer un crimen (c/30m)
┣ #slut — Ganar coins fácil (c/45m)
┣ #coinflip #flip #cf [cant] [cara/cruz]
┣ #ruleta [rojo|negro] [cant]
┣ #robar #rob @user — Robar coins
┣ #pay #transferir @user [cant]
┣ #dep [cant|all] — Depositar al banco
┣ #retirar [cant|all] — Retirar del banco
┣ #baltop — Top de coins
┣ #tienda — Ver tienda
┣ #comprar <id> — Comprar artículo
┗ #inventario — Tu inventario

👤 *PERFILES*
┣ #perfil [@user] — Ver perfil
┣ #level [@user] — Ver nivel y XP
┣ #leaderboard | #top — Top XP
┣ #setbirth DD/MM/AAAA — Cumpleaños
┣ #setdesc [descripción]
┣ #setgenre hombre|mujer
┣ #marry @user — Casarse
┣ #divorce — Divorciarse
┗ #cumpleanos — Cumpleaños del mes

🎮 *ANIME (reacciones)*
┣ #hug #kiss #pat #slap #dance
┣ #cry #bite #blush #cuddle #poke
┣ #punch #laugh #run #sad #angry
┣ #wave #bored #facepalm #happy
┣ #think #sleep #wink #lick
┗ #tickle #eat #kill #wink

🔞 *NSFW (imágenes)*
┣ #neko #waifu #hentai #loli
┣ #ass #pussy #boobs #cum
┗ #blowjob #anal #yuri

🔞 *NSFW (acciones)*
┣ #fuck #spank #handjob #fap
┣ #cum #yuri #sixnine #undress
┣ #grope #suckboobs #lickass
┣ #footjob #boobjob #cumshot
┗ #lickpussy #lickdick #cummouth

📥 *DESCARGAS*
┣ #yt <link> — Video YouTube (máx 5min)
┣ #play <link> — Audio YouTube
┣ #search <búsqueda> — Buscar en YouTube
┣ #tiktok <link> — Video TikTok
┣ #ig <link> — Reel de Instagram
┣ #twitter <link> — Video Twitter/X
┣ #pinterest <búsqueda> — Imágenes
┗ #img <link> — Descargar imagen

🛠️ *UTILIDADES*
┣ #ping — Latencia del bot
┣ #status — Estado del bot
┣ #del — Eliminar mensaje (citar)
┣ #pfp [@user] — Foto de perfil
┣ #tag [msg] — Mencionar a todos
┣ #sticker — Imagen/video a sticker
┗ #toimage — Sticker a imagen

👑 *ADMIN (solo admins)*
┣ #kick @user — Expulsar
┣ #promote @user — Hacer admin
┣ #demote @user — Quitar admin
┣ #warn @user [razón] — Advertir
┣ #delwarn @user — Quitar advertencia
┣ #warns @user — Ver advertencias
┣ #setwarnlimit <n> — Límite warns
┣ #antilink enable|disable
┣ #welcome enable|disable
┣ #goodbye enable|disable
┣ #setwelcome [texto]
┣ #setgoodbye [texto]
┣ #onlyadmin enable|disable
┣ #open — Abrir grupo
┣ #close — Cerrar grupo
┗ #topmensajes — Top activos

_⚡ Nexus Bot — Siempre activo para ti 😈_`;

    await sock.sendMessage(jid, { text: menu });
}

module.exports = { enviarMenu };
