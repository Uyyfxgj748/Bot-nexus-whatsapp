const ytdl = require('ytdl-core');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

ffmpeg.setFfmpegPath(ffmpegPath);

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
        await new Promise((resolve, reject) => {
            ytdl(url, { quality: 'lowest', filter: 'audioandvideo' })
                .pipe(fs.createWriteStream(tmpPath))
                .on('finish', resolve)
                .on('error', reject);
        });
        const buffer = await fs.readFile(tmpPath);
        await sock.sendMessage(jid, { video: buffer, caption: `🎬 *${titulo}*` });
        await fs.remove(tmpPath);
    } catch (err) {
        await fs.remove(tmpPath).catch(() => {});
        await sock.sendMessage(jid, { text: `❌ Error al descargar: ${err.message}` });
    }
}

async function cmdYoutubeAudio(sock, jid, args) {
    const url = args[0];
    if (!url || !ytdl.validateURL(url)) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de YouTube.\nUso: *#play <link>*' });
        return;
    }
    await sock.sendMessage(jid, { text: '⏳ Descargando audio de YouTube...' });
    const tmpMp4 = path.join(os.tmpdir(), `yta_${Date.now()}.mp4`);
    const tmpMp3 = path.join(os.tmpdir(), `yta_${Date.now()}.mp3`);
    try {
        const info = await ytdl.getInfo(url);
        const titulo = info.videoDetails.title;
        await new Promise((resolve, reject) => {
            ytdl(url, { quality: 'lowestaudio', filter: 'audioonly' })
                .pipe(fs.createWriteStream(tmpMp4))
                .on('finish', resolve)
                .on('error', reject);
        });
        await new Promise((resolve, reject) => {
            ffmpeg(tmpMp4).toFormat('mp3').on('end', resolve).on('error', reject).save(tmpMp3);
        });
        const buffer = await fs.readFile(tmpMp3);
        await sock.sendMessage(jid, { audio: buffer, mimetype: 'audio/mp4', ptt: false, fileName: `${titulo}.mp3` });
        await fs.remove(tmpMp4);
        await fs.remove(tmpMp3);
    } catch (err) {
        await fs.remove(tmpMp4).catch(() => {});
        await fs.remove(tmpMp3).catch(() => {});
        await sock.sendMessage(jid, { text: `❌ Error al descargar audio: ${err.message}` });
    }
}

async function cmdTiktok(sock, jid, args) {
    const url = args[0];
    if (!url || !url.includes('tiktok')) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de TikTok.\nUso: *#tiktok <link>*' });
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
        await sock.sendMessage(jid, { video: buffer, caption: `🎵 *${titulo}*` });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ Error al descargar TikTok: ${err.message}` });
    }
}

async function cmdTwitter(sock, jid, args) {
    const url = args[0];
    if (!url || (!url.includes('twitter.com') && !url.includes('x.com'))) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link válido de Twitter/X.\nUso: *#twitter <link>*' });
        return;
    }
    await sock.sendMessage(jid, { text: '⏳ Descargando video de Twitter/X...' });
    try {
        const apiUrl = `https://twitsave.com/info?url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl, { timeout: 15000 });
        const match = res.data.match(/https?:\/\/[^"]+\.mp4[^"]*/);
        if (!match) {
            await sock.sendMessage(jid, { text: '❌ No encontré video en ese tweet.' });
            return;
        }
        const videoRes = await axios.get(match[0], { responseType: 'arraybuffer', timeout: 30000 });
        const buffer = Buffer.from(videoRes.data);
        await sock.sendMessage(jid, { video: buffer, caption: '🐦 Video de Twitter/X' });
    } catch (err) {
        await sock.sendMessage(jid, { text: `❌ Error al descargar: ${err.message}` });
    }
}

async function cmdImagen(sock, jid, args) {
    const url = args[0];
    if (!url) {
        await sock.sendMessage(jid, { text: '❌ Ingresa un link de imagen.\nUso: *#img <link>*' });
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

module.exports = { cmdYoutube, cmdYoutubeAudio, cmdTiktok, cmdTwitter, cmdImagen };
