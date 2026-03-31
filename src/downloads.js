const ytdl = require('@distube/ytdl-core');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

ffmpeg.setFfmpegPath(ffmpegPath);

const axiosOpts = {
    timeout: 20000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    }
};

async function descargarBuffer(url) {
    const res = await axios.get(url, { ...axiosOpts, responseType: 'arraybuffer', timeout: 40000 });
    return Buffer.from(res.data);
}

async function cmdYoutube(sock, jid, args) {
    const url = args[0];
    if (!url || !ytdl.validateURL(url)) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de YouTube.\nUso: *#yt <link>*' });
        return;
    }
    await sock.sendMessage(jid, { text: '⏳ Descargando video de YouTube...' });
    const tmpPath = path.join(os.tmpdir(), `yt_${Date.now()}.mp4`);
    try {
        const info = await ytdl.getInfo(url);
        const titulo = info.videoDetails.title;
        if (parseInt(info.videoDetails.lengthSeconds) > 300) {
            await sock.sendMessage(jid, { text: '❌ El video es muy largo. Máximo 5 minutos.' });
            return;
        }
        const formato = ytdl.chooseFormat(info.formats, { quality: 'lowestvideo', filter: 'audioandvideo' });
        await new Promise((resolve, reject) => {
            ytdl.downloadFromInfo(info, { format: formato })
                .pipe(fs.createWriteStream(tmpPath))
                .on('finish', resolve)
                .on('error', reject);
        });
        const buffer = await fs.readFile(tmpPath);
        await sock.sendMessage(jid, { video: buffer, caption: `🎬 *${titulo}*` });
        await fs.remove(tmpPath);
    } catch (err) {
        await fs.remove(tmpPath).catch(() => {});
        await sock.sendMessage(jid, { text: `❌ Error al descargar YouTube: ${err.message}` });
    }
}

async function cmdYoutubeAudio(sock, jid, args) {
    const url = args[0];
    if (!url || !ytdl.validateURL(url)) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de YouTube.\nUso: *#play <link>*' });
        return;
    }
    await sock.sendMessage(jid, { text: '⏳ Descargando audio de YouTube...' });
    const tmpInput = path.join(os.tmpdir(), `yta_in_${Date.now()}.webm`);
    const tmpMp3 = path.join(os.tmpdir(), `yta_out_${Date.now()}.mp3`);
    try {
        const info = await ytdl.getInfo(url);
        const titulo = info.videoDetails.title;
        await new Promise((resolve, reject) => {
            ytdl.downloadFromInfo(info, { quality: 'lowestaudio', filter: 'audioonly' })
                .pipe(fs.createWriteStream(tmpInput))
                .on('finish', resolve)
                .on('error', reject);
        });
        await new Promise((resolve, reject) => {
            ffmpeg(tmpInput).toFormat('mp3').on('end', resolve).on('error', reject).save(tmpMp3);
        });
        const buffer = await fs.readFile(tmpMp3);
        await sock.sendMessage(jid, { audio: buffer, mimetype: 'audio/mpeg', ptt: false });
        await fs.remove(tmpInput).catch(() => {});
        await fs.remove(tmpMp3).catch(() => {});
    } catch (err) {
        await fs.remove(tmpInput).catch(() => {});
        await fs.remove(tmpMp3).catch(() => {});
        await sock.sendMessage(jid, { text: `❌ Error al descargar audio: ${err.message}` });
    }
}

async function tiktokDescargar(url) {
    const apis = [
        async () => {
            const res = await axios.post('https://www.tikwm.com/api/', { url, hd: 0 }, { ...axiosOpts, timeout: 15000 });
            if (res.data?.code === 0 && res.data?.data?.play) {
                return { videoUrl: res.data.data.play, titulo: res.data.data.title || 'TikTok' };
            }
            throw new Error('tikwm falló');
        },
        async () => {
            const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, axiosOpts);
            if (res.data?.video?.noWatermark) {
                return { videoUrl: res.data.video.noWatermark, titulo: res.data.title || 'TikTok' };
            }
            throw new Error('tiklydown falló');
        },
        async () => {
            const res = await axios.get(`https://tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com/index?url=${encodeURIComponent(url)}`, {
                ...axiosOpts,
                headers: { ...axiosOpts.headers, 'X-RapidAPI-Host': 'tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com' }
            });
            if (res.data?.video?.[0]) {
                return { videoUrl: res.data.video[0], titulo: 'TikTok' };
            }
            throw new Error('rapid falló');
        }
    ];
    for (const api of apis) {
        try { return await api(); } catch {}
    }
    throw new Error('No se pudo obtener el video de TikTok con ninguna API.');
}

async function cmdTiktok(sock, jid, args) {
    const url = args[0];
    if (!url || !url.includes('tiktok')) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de TikTok.\nUso: *#tiktok <link>*' });
        return;
    }
    await sock.sendMessage(jid, { text: '⏳ Descargando video de TikTok...' });
    try {
        const { videoUrl, titulo } = await tiktokDescargar(url);
        const buffer = await descargarBuffer(videoUrl);
        await sock.sendMessage(jid, { video: buffer, caption: `🎵 *${titulo}*` });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ Error al descargar TikTok: ${err.message}` });
    }
}

async function twitterDescargar(url) {
    const tweetId = url.match(/status\/(\d+)/)?.[1];
    if (!tweetId) throw new Error('URL inválida');
    const apis = [
        async () => {
            const res = await axios.get(`https://api.vxtwitter.com/Twitter/status/${tweetId}`, axiosOpts);
            const media = res.data?.media_extended?.find(m => m.type === 'video');
            if (media?.url) return media.url;
            throw new Error('vxtwitter falló');
        },
        async () => {
            const res = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(url)}`, axiosOpts);
            const match = res.data.match(/https?:\/\/video\.twimg\.com\/[^"'\s]+\.mp4[^"'\s]*/);
            if (match) return match[0];
            throw new Error('twitsave falló');
        }
    ];
    for (const api of apis) {
        try { return await api(); } catch {}
    }
    throw new Error('No se pudo obtener el video de Twitter/X.');
}

async function cmdTwitter(sock, jid, args) {
    const url = args[0];
    if (!url || (!url.includes('twitter.com') && !url.includes('x.com'))) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de Twitter/X.\nUso: *#twitter <link>*' });
        return;
    }
    await sock.sendMessage(jid, { text: '⏳ Descargando video de Twitter/X...' });
    try {
        const videoUrl = await twitterDescargar(url);
        const buffer = await descargarBuffer(videoUrl);
        await sock.sendMessage(jid, { video: buffer, caption: '🐦 Video de Twitter/X' });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ Error al descargar Twitter/X: ${err.message}` });
    }
}

async function cmdImagen(sock, jid, args) {
    const url = args[0];
    if (!url) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link de imagen.\nUso: *#img <link>*' });
        return;
    }
    try {
        const buffer = await descargarBuffer(url);
        await sock.sendMessage(jid, { image: buffer, caption: '🖼️ Imagen descargada' });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ No pude descargar la imagen: ${err.message}` });
    }
}

module.exports = { cmdYoutube, cmdYoutubeAudio, cmdTiktok, cmdTwitter, cmdImagen };
