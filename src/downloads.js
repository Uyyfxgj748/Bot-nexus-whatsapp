const ytdl = require('ytdl-core');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

async function cmdYoutube(sock, jid, args) {
    const url = args[0];
    if (!url || !ytdl.validateURL(url)) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de YouTube.\nUso: *!yt <link>*' });
        return;
    }

    await sock.sendMessage(jid, { text: '⏳ Descargando video de YouTube...' });

    const tmpPath = path.join(os.tmpdir(), `yt_${Date.now()}.mp4`);

    try {
        const info = await ytdl.getInfo(url);
        const titulo = info.videoDetails.title;
        const duracion = parseInt(info.videoDetails.lengthSeconds);

        if (duracion > 300) {
            await sock.sendMessage(jid, { text: '❌ El video es muy largo. Máximo 5 minutos.' });
            return;
        }

        await new Promise((resolve, reject) => {
            ytdl(url, { quality: 'lowest', filter: 'audioandvideo' })
                .pipe(fs.createWriteStream(tmpPath))
                .on('finish', resolve)
                .on('error', reject);
        });

        const buffer = await fs.readFile(tmpPath);
        await sock.sendMessage(jid, {
            video: buffer,
            caption: `🎬 *${titulo}*`
        });
        await fs.remove(tmpPath);
    } catch (err) {
        await fs.remove(tmpPath).catch(() => {});
        await sock.sendMessage(jid, { text: `❌ Error al descargar: ${err.message}` });
    }
}

async function cmdTiktok(sock, jid, args) {
    const url = args[0];
    if (!url || !url.includes('tiktok')) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de TikTok.\nUso: *!tiktok <link>*' });
        return;
    }

    await sock.sendMessage(jid, { text: '⏳ Descargando video de TikTok...' });

    try {
        const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl, { timeout: 15000 });

        if (!res.data || !res.data.video) {
            await sock.sendMessage(jid, { text: '❌ No pude obtener el video. Intenta de nuevo.' });
            return;
        }

        const videoUrl = res.data.video.noWatermark || res.data.video.cover;
        const titulo = res.data.title || 'Video TikTok';

        const videoRes = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const buffer = Buffer.from(videoRes.data);

        await sock.sendMessage(jid, {
            video: buffer,
            caption: `🎵 *${titulo}*`
        });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ Error al descargar TikTok: ${err.message}` });
    }
}

async function cmdImagen(sock, jid, args) {
    const url = args[0];
    if (!url) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link de imagen.\nUso: *!img <link>*' });
        return;
    }

    try {
        const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
        const buffer = Buffer.from(res.data);
        await sock.sendMessage(jid, { image: buffer, caption: '🖼️ Imagen descargada' });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ No pude descargar la imagen: ${err.message}` });
    }
}

module.exports = { cmdYoutube, cmdTiktok, cmdImagen };
