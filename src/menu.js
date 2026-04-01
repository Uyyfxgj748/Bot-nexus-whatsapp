async function enviarMenu(sock, jid) {
    const menu = `╭━━━〔 ⚡ NEXUS BOT 😈 〕━━━╮
┃  Sistema activo • Online 24/7
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭─ 🎰 ECONOMÍA
│  ◦ #balance | #bal | #coins
│  ◦ #daily | #diario
│  ◦ #work | #w
│  ◦ #crime | #slut
│  ◦ #coinflip #cf [cant] [cara/cruz]
│  ◦ #ruleta [rojo|negro] [cant]
│  ◦ #robar @user | #pay @user [cant]
│  ◦ #dep [cant|all] | #retirar [cant|all]
│  ◦ #baltop
│  ◦ #tienda | #comprar <id>
│  ◦ #inventario
╰───────────────

╭─ 👤 PERFILES
│  ◦ #perfil [@user]
│  ◦ #level [@user]
│  ◦ #leaderboard | #top
│  ◦ #setbirth DD/MM/AAAA
│  ◦ #setdesc [texto]
│  ◦ #setgenre hombre|mujer
│  ◦ #marry @user | #divorce
│  ◦ #cumpleanos
╰───────────────

╭─ 🎮 ANIME (Reacciones)
│  ◦ #hug #kiss #pat #slap #dance
│  ◦ #cry #bite #blush #cuddle
│  ◦ #poke #punch #laugh #run
│  ◦ #sad #angry #wave #bored
│  ◦ #facepalm #happy #think
│  ◦ #sleep #wink #lick #tickle
│  ◦ #eat #kill
╰───────────────

╭─ 🔞 NSFW (Imágenes)
│  ◦ #neko #waifu #hentai
│  ◦ #ass #boobs #pussy
│  ◦ #yuri #cum
╰───────────────

╭─ 🔞 NSFW (Acciones)
│  ◦ #fuck #spank #fap
│  ◦ #yuri #sixnine #undress
│  ◦ #grope #footjob #boobjob
│  ◦ #cumshot #cummouth
╰───────────────

╭─ 📥 DESCARGAS
│  ◦ #yt <link>
│  ◦ #play <link o nombre>
│  ◦ #search <búsqueda>
│  ◦ #tiktok <link>
│  ◦ #ig <link>
│  ◦ #twitter <link>
│  ◦ #pinterest <búsqueda>
│  ◦ #img <link>
╰───────────────

╭─ 🛠️ UTILIDADES
│  ◦ #ping | #status
│  ◦ #del (citar msg)
│  ◦ #pfp [@user]
│  ◦ #tag [mensaje]
│  ◦ #sticker | #toimage
│  ◦ #stickersearch <búsqueda>
╰───────────────

╭─ 👑 ADMIN
│  ◦ #kick @user
│  ◦ #promote | #demote
│  ◦ #warn @user [razón]
│  ◦ #delwarn | #warns
│  ◦ #setwarnlimit <n>
│  ◦ #antilink on/off
│  ◦ #welcome on/off
│  ◦ #goodbye on/off
│  ◦ #setwelcome [texto]
│  ◦ #setgoodbye [texto]
│  ◦ #onlyadmin on/off
│  ◦ #open | #close
│  ◦ #topmensajes
╰───────────────

╭━━━〔 ⚡ NEXUS BOT 〕━━━╮
┃  Siempre activo para ti 😈
╰━━━━━━━━━━━━━━━━━━━━━━╯`;

    await sock.sendMessage(jid, { text: menu });
}

module.exports = { enviarMenu };
